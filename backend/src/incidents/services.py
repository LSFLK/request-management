import os
import requests
import _thread

from .models import (
    Incident,
    IncidentStatus,
    StatusType,
    SeverityType,
    Reporter,
    Recipient,
    IncidentComment,
    IncidentPoliceReport,
    VerifyWorkflow,
    EscalateExternalWorkflow,
    CompleteActionWorkflow,
    RequestInformationWorkflow,
    ProvideInformationWorkflow,
    AssignUserWorkflow,
    EscalateWorkflow,
    CloseWorkflow,
    InvalidateWorkflow,
    ReopenWorkflow,
    CannedResponse,
    SendCannedResponseWorkflow,
    Category
)
from ..common.models import (Channel)
from django.contrib.auth.models import User, Group, Permission
from django.contrib.contenttypes.models import ContentType

from ..events import services as event_services
from ..events.models import Event
from ..file_upload.models import File
from ..custom_auth.models import Division, UserLevel, Profile
from django.db import connection

from datetime import datetime
from .exceptions import WorkflowException, IncidentException
import pandas as pd
from django.http import HttpResponse
from xhtml2pdf import pisa
import json
from rest_framework.renderers import StaticHTMLRenderer
from django.db.models import Q
from .permissions import *

from ..notifications.services import add_notification
from ..notifications.models import NotificationType

from django.core.mail import send_mail

from .serializers import IncidentCommentSerializer

from zeep import Client
from zeep.wsse.username import UsernameToken
import requests
from django.conf import settings

def generate_refId(user):
    """ Function to generate refId for requests on creation """

    today = datetime.now().replace(month=1, day=1, hour=0, minute=0, second=0)
    current_count = Incident.objects.filter(created_date__gte=today).count()

    if user == "GUEST" :
        default_division = Division.objects.get(is_default_division=True)
        refId = "GMS/%s/%s/%d" % (default_division.organization.code.upper(), str(today.year), current_count + 1)
    else:
        profile = Profile.objects.get(user=user)
        refId = "GMS/%s/%s/%d" % (profile.organization.code.upper(), str(today.year), current_count + 1)

    return refId

def get_incident_status_guest(refId):
    """This function is to annouce public on a incident status"""
    status = {}
    try:
        incident = Incident.objects.get(refId=refId)
    except Incident.DoesNotExist:
        status["reply"] = "No records for the given reference number. Please check and submit."
        return status

    if incident.current_status == StatusType.NEW.name:
        status["reply"] = "Your request has been received. Please check again later for status updates."
    elif incident.current_status == StatusType.VERIFIED.name:
        status["reply"] = "Your request has been acknowledged."
    elif incident.current_status == StatusType.INFORMATION_REQESTED.name or has_pending_information_request(incident):
        status = get_public_status_on_information_request(incident)
    elif incident.current_status == StatusType.ACTION_PENDING.name or incident.current_status == StatusType.ACTION_TAKEN.name \
        or incident.current_status == StatusType.INFORMATION_PROVIDED.name:
        status["reply"] = "Your request is currently being attended to."
    elif incident.current_status == StatusType.CLOSED.name:
        status = get_public_status_on_close(incident)
    elif incident.current_status == StatusType.INVALIDATED.name:
        status["reply"] = "We regret, we will not be able to proceed with your request at this time. \
            Please feel free to access this system for future needs or requests. We look forward to serving you."

    return status

def has_pending_information_request(incident):
    """ function that returns boolean, on pending information requests """

    requests = RequestInformationWorkflow.objects.filter(incident=incident, is_information_provided=False)
    if len(requests) > 0 :
        return True
    else:
        return False


def get_public_status_on_information_request(incident):
    status = {}
    messages = []

    # get all information requests
    requests = RequestInformationWorkflow.objects.filter(incident=incident, is_information_provided=False)
    # we will not be looping at the moment.
    # reason: looping will give serveral input forms, which is not properly handled on frontend yet.
    output = {}
    output["header"] = "Required information"
    output["content"] = requests[0].comment

    actions = {}
    actions["name"] = "Submit reply"
    actions["incident_id"] = requests[0].incident_id
    information_request_model_type = ContentType.objects.get(app_label='incidents', model='RequestInformationWorkflow')
    event = Event.objects.get(reference_id=requests[0].id, refered_model_type=information_request_model_type)
    actions["start_event"] = event.id

    output["actions"] = actions

    messages.append(output)

    status["reply"] = "Your request requires further information to proceed. Please provide the following \
        details at your earliest convenience."
    status["messages"] = messages

    return status

def get_public_status_on_close(incident):
    status = {}
    messages = []

    # FIXME: check for status type on StatusType.CLOSED.name
    # prepare resolution messages
    close = CloseWorkflow.objects.filter(incident=incident).order_by('-created_date')
    output = {}
    output["header"] = "Resolution"
    # get the last close comment
    output["content"] = close[0].comment
    messages.append(output)

    status["reply"] = "Your request has been resolved and closed."
    status["messages"] = messages

    return status

def send_email(subject, message, receivers):
    try :
        send_mail(
            subject,
            message,
            settings.EMAIL_FROM_ADDRESS,
            receivers,
            fail_silently=False,
        )
        print("email sent to:")
        print(*receivers)

    except Exception as e:
        print("email sending failed to :")
        print(*receivers)
        print(e)


def send_sms(number, message):
    number = "94" + number[-9:]
    headers = {'content-type': 'text/xml'}

    body = """<?xml version='1.0' encoding='utf-8'?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://schemas.icta.lk/xsd/kannel/handler/v1/" soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
<soapenv:Header>
<govsms:authData xmlns:govsms="http://govsms.icta.lk/">
<govsms:user>{2}</govsms:user>
<govsms:key>{3}</govsms:key>
</govsms:authData>
</soapenv:Header>
<soapenv:Body>
<v1:SMSRequest>
<v1:requestData>
<v1:outSms>{1}</v1:outSms>
<v1:recepient>{0}</v1:recepient>
<v1:depCode>IctaTest</v1:depCode>
<v1:smscId/>
<v1:billable/>
</v1:requestData>
</v1:SMSRequest>
</soapenv:Body>
</soapenv:Envelope>
""".format(number, message, settings.SMS_GATEWAY_USER, settings.SMS_GATEWAY_PASSWORD)

    response = requests.post(settings.SMS_GATEWAY_BASE_URL+"/services/GovSMSMTHandlerProxy?wsdl",data=body,headers=headers)
    print("response")
    print(response.status_code)
    print(response.reason)

def send_sms_to_list(recievers, message):
    for reciever in recievers:
        send_sms(reciever, message)

def send_incident_changed_email_sms(incident, subject, message):
    """ function to send email and sms to reporters and recipient to the given incident. """
    email_recievers = []
    sms_recievers = []

    if (incident.reporter):
        if (incident.reporter.email):
            email_recievers.append(incident.reporter.email)
        if (incident.reporter.mobile):
            sms_recievers.append(incident.reporter.mobile)

    if (incident.recipient):
        if (incident.recipient.email) :
            email_recievers.append(incident.recipient.email)
        if (incident.recipient.mobile) :
            sms_recievers.append(incident.recipient.mobile)

    if email_recievers :
        print("sending email")
        try:
            _thread.start_new_thread( send_email, ( subject, message, email_recievers) )
        except:
            print ("Error: unable to start information requested email sending thread")

    if sms_recievers :
        print("sending sms")
        try:
            _thread.start_new_thread( send_sms_to_list, (sms_recievers, message))
        except Exception as e:
            print("information requested sms sending failed with exception: ")
            print(e)

def send_incident_created_mail_sms(reporter_id):
    """ request created content for correspondance """

    # reporter = get_reporter_by_id(reporter_id)
    incident = Incident.objects.get(reporter=reporter_id)
    print("sending incident created email and sms")
    subject = 'Your Request Recieved'
    message = """Your request has been received and is being attended to.
Ref ID: {0}
To check status:
{1}/report/status?refId={0}""".format(incident.refId, settings.APP_BASE_URL)

    send_incident_changed_email_sms(incident, subject, message)

def is_valid_incident(incident_id: str) -> bool:
    try:
        incident = Incident.objects.get(id=incident_id)
        return True
    except Exception as e:
        return False

def validateRecaptcha(response: str) -> bool:
    params = {
        'secret': os.environ.get('RECAPTCHA_SECRET_KEY'),
        'response': response
    }
    validationResponse = requests.post(
        'https://www.google.com/recaptcha/api/siteverify',
        params
    )
    return validationResponse.json()['success']


def get_incident_by_id(incident_id: str) -> Incident:
    try:
        incident = Incident.objects.get(id=incident_id)
        if incident is None:
            raise IncidentException("Invalid incident id")
    except:
        raise IncidentException("Invalid incident id")

    return incident


def get_user_by_id(user_id: str) -> User:
    try:
        user = User.objects.get(id=user_id)
        if user is None:
            raise IncidentException("Invalid user id")
    except:
        raise IncidentException("Invalid user id")

    return user

def get_group_by_id(group_id: str) -> User:
    try:
        user = Group.objects.get(id=group_id)
        if user is None:
            raise IncidentException("Invalid group id")
    except:
        raise IncidentException("Invalid group id")

    return user


def get_reporter_by_id(reporter_id: str) -> Incident:
    try:
        return Reporter.objects.get(id=reporter_id)
    except Exception as e:
        return None

def get_recipient_by_id(recipient_id: str) -> Incident:
    try:
        return Recipient.objects.get(id=recipient_id)
    except Exception as e:
        return None

def get_comments_by_incident(incident: Incident) -> IncidentComment:
    try:
        return IncidentComment.objects.get(incident=incident)
    except Exception as e:
        return None

def get_user_group(user: User):
    user_groups = user.groups.all()
    if len(user_groups) == 0:
        raise WorkflowException("No group for current assignee")

    return user_groups[0]

def get_user_orgnaization(user: User):
    user_org = Group.objects.get(id=get_user_group(user).organization_id)
    return user_org

def get_guest_user():
    try:
        return User.objects.get(username="guest")
    except:
        raise IncidentException("No guest user available")

def user_level_has_permission(user_level: UserLevel, permission: Permission):
    permissions = Permission.objects.filter(group=user_level.role)
    return permission in permissions

def get_user_from_level(user_level: UserLevel, division: Division) -> User:

    """ This function would take in a user level and find the user
        within the level that has the least workload
        It will query the assignee counts for each user and get the
        one with lowest assignments
    """

    sql = """
            SELECT usr.id, COUNT(incident.id) as incident_count FROM `auth_user` as usr
            LEFT JOIN incidents_incident as incident on incident.assignee_id = usr.id
            INNER JOIN custom_auth_profile as prf on prf.user_id = usr.id
            INNER JOIN custom_auth_userlevel as ulvl on prf.level_id = ulvl.id
            INNER JOIN auth_group as grp on ulvl.role_id = grp.id
            INNER JOIN custom_auth_division as udiv on prf.division_id = udiv.id
            WHERE ulvl.code = "%s" AND udiv.code = "%s" AND usr.is_active = true
            GROUP BY usr.id
            ORDER BY incident_count ASC
          """ % (user_level.code, division.code)

    with connection.cursor() as cursor:
        cursor.execute(sql)
        row = cursor.fetchone()

        if row is None:
            return None

        try:
            assignee = User.objects.get(id=row[0])
            return assignee
        except:
            return None

def find_candidate_from_division(current_division: Division, current_level: UserLevel, required_permission: Permission=None):
    parent_level = current_level.parent

    new_assignee = None

    while new_assignee is None:
        if parent_level is None:
            # reached the top most position of current division
            break

        if required_permission is None or (
            required_permission is not None and user_level_has_permission(parent_level, required_permission)
        ):
            assignee = get_user_from_level(parent_level, current_division)

            if assignee is not None:
                new_assignee = assignee
                break

        # if the current user level doesn't have the permission or no assignees from
        # current level
        # check the parent user level of the current parent
        # ie: traversing upwards the user hierarchy
        parent_level = parent_level.parent

    return new_assignee


def find_escalation_candidate(current_user: User) -> User:
    """ This function finds an esclation candidate within the
        <b>same organization</b>
    """
    current_division = current_user.profile.division
    current_level = current_user.profile.level

    # first check if we can find a candidate from the same division
    # ex: EC Gampaha Cordinator -> EC Gampaha Manager
    new_assignee = find_candidate_from_division(current_division, current_level)

    # either found an assignee or exhausted the current division
    if new_assignee is not None:
        return new_assignee

    # this part means we have to search in the HQ of the organization
    # for an assignee
    hq_division = Division.objects.get(Q(is_hq=True) &
                                        Q(organization=current_user.profile.organization))
    if hq_division is None:
        raise WorkflowException("Organization Hierarchy Configure Error - No HQ defined")

    # in the new divsion, we start the search from the
    # same level as the current user's parent
    # if current user is Cordinator, we start with Managers in HQ
    new_assignee = find_candidate_from_division(hq_division, current_level)

    if new_assignee is None:
        raise WorkflowException("Can't find escalation candidate for current user")

    return new_assignee

def find_incident_assignee(current_user: User):
    assignee = None
    required_permission = Permission.objects.get(codename=CAN_MANAGE_INCIDENT)
    default_division = Division.objects.get(is_default_division=True)

    # first if a public user case
    if current_user.username == "guest":
        # guest is a user level under EC organization
        # ideally we can check if the parent of the current user has
        # permissions
        assignee = find_candidate_from_division(default_division, current_user.profile.level)

    else:
        # this is a logged in user
        # first check if the current user has the permission to manage an incident
        if user_level_has_permission(current_user.profile.level, required_permission):
            # if so assign it to self
            return current_user
        else:
            # if not, first check if the current user is from EC -> or default org
            if current_user.profile.organization == default_division.organization:
                # then we can do a escalation on the assignment
                assignee = find_escalation_candidate(current_user)
            else:
                # then this should be Police or anything else
                # then we ONLY try to assign this to someone at the EC HQ
                # ie: default division HQ
                guest_user = get_guest_user()
                assignee = find_candidate_from_division(default_division, guest_user.profile.level)

    if assignee is None:
        raise WorkflowException("Error in finding assignee")

    return assignee
def create_reporter():
    return Reporter()

def create_incident_postscript(incident: Incident, user: User) -> None:
    """Function to take care of event, status and severity creation"""
    if user is None:
        # public user case
        # if no auth token, then we assign the guest user as public user
        user = get_guest_user()

    reporter = Reporter()
    reporter.save()

    incident.created_by = user
    if(not incident.reporter):
        incident.reporter = reporter
    # incident.reporter = reporter
    incident.assignee = user
    incident.save()

    event_services.create_incident_event(user, incident)

    assignee = find_incident_assignee(user)
    incident.assignee = assignee

    # TODO: for police users, set the linked individuals property
    if user.profile.organization != assignee.profile.organization:
        incident.linked_individuals.add(user)

    incident.save()


    status = IncidentStatus(current_status=StatusType.NEW,
                            incident=incident, approved=True)
    status.save()

    return incident

def update_incident_postscript(incident: Incident, user: User, revision: str) -> None:
    event_services.update_incident_event(user, incident, revision)


def update_incident_status(
    incident: Incident, user: User, status_type_str: str
) -> None:

    if incident.hasPendingStatusChange == "T":
        return ("error", "Incident status is locked for pending changes")

    try:
        # check for valid status type
        status_type = StatusType[status_type_str]
    except:
        return ("error", "Invalid status type")

    if user.has_perm("incidents.can_request_status_change"):
        # if user can't directly change the status
        # only a pending change is added
        status = IncidentStatus(
            current_status=status_type,
            previous_status=incident.current_status,
            incident=incident,
            approved=False,
        )
        status.save()
        incident.hasPendingStatusChange = "T"
        incident.save()
        event_services.update_incident_status_event(
            user, incident, status, False)

    elif user.has_perm("incidents.can_change_status"):
        status = IncidentStatus(
            current_status=status_type,
            previous_status=incident.current_status,
            incident=incident,
            approved=True,
        )
        status.save()
        incident.hasPendingStatusChange = "F"
        incident.save()
        event_services.update_incident_status_event(
            user, incident, status, True)

    return ("success", "Status updated")

def create_incident_comment_postscript(
    incident: Incident, user: User, comment: IncidentComment
) -> None:
    """Function to take care of event, status and severity creation"""

    if comment.is_outcome:
        event_services.create_outcome_event(user, incident, comment)
    else:
        event_services.create_comment_event(user, incident, comment)


def get_incidents_by_status(status_type_str: str) -> Incident:
    try:
        incidents = Incident.objects.all()
        filtered_incidents = (
            incident for incident in incidents if incident.current_status == status_type_str)
        return filtered_incidents
    except Exception as e:
        return None


def get_incidents_before_date(date: str) -> Incident:
    try:
        return Incident.objects.all().filter(created_date__lte=date)
    except Exception as e:
        return None


def incident_escalate(user: User, incident: Incident, escalate_dir: str = "UP", comment=None, response_time=None):
    if incident.assignee != user:
        raise WorkflowException("Only current incident assignee can escalate the incident")

    if (
        # incident.current_status == StatusType.VERIFIED.name
        incident.current_status == StatusType.NEW.name
        or incident.current_status == StatusType.REOPENED.name
        or incident.current_status == StatusType.ACTION_PENDING.name
        or incident.current_status == StatusType.INFORMATION_REQESTED.name
    ) :
        raise WorkflowException("Incident cannot be escalated at this Status")

    # find the rank of the current incident assignee
    # assignee_groups = incident.assignee.groups.all()
    # if len(assignee_groups) == 0:
    #     raise WorkflowException("No group for current assignee")

    # current_rank = assignee_groups[0].rank

    # # if escalate UP
    # next_rank = current_rank - 1
    # if escalate_dir == "DOWN":
    #     next_rank = current_rank + 1

    # organization = get_user_orgnaization(user)
    # next_group = Group.objects.get(rank=next_rank, organization_id=organization)

    # if next_group is None:
    #     raise WorkflowException("Can't escalate %s from here" % escalate_dir)

    # assignee = incident_auto_assign(incident, next_group)

    assignee = find_escalation_candidate(user)
    incident.assignee = assignee
    incident.save()

    # workflow
    workflow = EscalateWorkflow(
        incident=incident,
        actioned_user=user,
        comment=comment,
        response_time=response_time,
        assignee=assignee
    )
    workflow.save()

    event_services.update_workflow_event(user, incident, workflow)


def incident_change_assignee(user: User, incident: Incident, assignee: User):
    # workflow
    workflow = AssignUserWorkflow(
        incident=incident,
        actioned_user=user,
        assignee=assignee
    )
    workflow.save()

    incident.assignee = assignee
    incident.save()

    # request assigned email
    print("sending request assigned email")
    if assignee.email:
        subject = 'Request Assigned'
        message = 'You have been assigned to a request. Reference ID' + incident.refId
        recievers = [assignee.email]
        try:
            _thread.start_new_thread( send_email, ( subject, message, recievers) )
        except:
            print ("Error: unable to start thread")
        print("request assigned email sent")

    event_services.update_workflow_event(user, incident, workflow)


def incident_close(user: User, incident: Incident, details: str):
    if details["remark"] == "":
        raise WorkflowException(
            "Final resolution comment must not be blank")

    # find number of outcomes for the incident
    # outcomes = IncidentComment.objects.filter(
    #     incident=incident, is_outcome=True).count()

    if incident.current_status == StatusType.INFORMATION_REQESTED.name:
        raise WorkflowException(
            "All pending advices must be resolved first")

    if incident.current_status == StatusType.ACTION_PENDING.name:
        raise WorkflowException(
            "All pending actions needs to be resolved first")

    comment_data = {
        "comment": details["remark"],
        "is_outcome": True
    }
    comment = IncidentComment(
        body=details["remark"],
        is_outcome=True,
        user=user,
        incident=incident
    )
    comment.save()
    create_incident_comment_postscript(incident, user, comment)

    # FIXME: set next pending status as the current status
    status = IncidentStatus(
        current_status=StatusType.CLOSED,
        previous_status=incident.current_status,
        incident=incident
    )
    status.save()

    # workflow
    workflow = CloseWorkflow(
        incident=incident,
        actioned_user=user,
        assignees=details["assignee"],
        entities=details["entities"],
        departments=details["departments"],
        individuals=details["individuals"],
        comment=details["remark"]
    )
    workflow.save()

    # request closed email and sms
    print("sending request closed email and sms")
    subject = "Your Request Closed"
    message = """Your request has been resolved.
Ref ID: {0}
To check status:
{1}/report/status?refId={0}""".format(incident.refId, settings.APP_BASE_URL)

    send_incident_changed_email_sms(incident, subject, message)
    # sending notifications
    # get the default Org/Division -> PS
    default_division = Division.objects.get(is_default_division=True)

    # check if the user from PS
    # if user.profile.organization != default_division.organization:
    # if issue closing user is not from PS, send notification
    # find PS user from linked users
    for linked_user in incident.linked_individuals.all():
        if linked_user.profile.organization == default_division.organization:
            # send notification
            add_notification(NotificationType.INCIDENT_CLOSED, 
                                    user, linked_user, incident)

    event_services.update_workflow_event(user, incident, workflow)

def incident_escalate_external_action(user: User, incident: Incident, entity: object, comment: str):
    evt_description = None

    is_internal_user = entity["isInternalUser"]
    workflow = EscalateExternalWorkflow(
        is_internal_user=is_internal_user,
        incident=incident,
        actioned_user=user,
        comment=comment
    )

    if is_internal_user:
        escalated_user = get_user_by_id(entity["name"])

        # adding the current assignee as a linked user
        incident.linked_individuals.add(user)

        incident.linked_individuals.add(escalated_user)
        incident.assignee = escalated_user
        incident.save()

        workflow.escalated_user = escalated_user

        # send notification
        add_notification(NotificationType.INCIDENT_ASSIGNED, user, escalated_user, incident)
    else:
        workflow.escalated_entity_other = entity["type"]
        workflow.escalated_user_other = entity["name"]

    workflow.save()

    status = IncidentStatus(
        current_status=StatusType.ACTION_PENDING,
        previous_status=incident.current_status,
        incident=incident,
        approved=True
    )
    status.save()

    event_services.update_workflow_event(user, incident, workflow)




def incident_complete_external_action(user: User, incident: Incident, comment: str, start_event: Event):
    initiated_workflow = start_event.refered_model

    # complete workflow
    workflow = CompleteActionWorkflow(
        incident=incident,
        actioned_user=user,
        comment=comment,
        initiated_workflow=initiated_workflow
    )
    workflow.save()

    # complete previous workflow
    initiated_workflow.is_action_completed = True

    # TODO: find why django do this
    if initiated_workflow.is_internal_user == None:
        initiated_workflow.is_internal_user = False

    initiated_workflow.save()

    # check if there are any more pending actions
    pending_actions = EscalateExternalWorkflow.objects.filter(Q(incident=incident) & Q(is_action_completed=False))
    if pending_actions.count() == 0:
        # new event
        status = IncidentStatus(
            current_status=StatusType.ACTION_TAKEN,
            previous_status=incident.current_status,
            incident=incident,
            approved=True
        )
        status.save()

    event_services.update_linked_workflow_event(user, incident, workflow, start_event)


def incident_request_information(user: User, incident: Incident, comment: str):
    if incident.current_status == StatusType.INFORMATION_REQESTED.name:
        raise WorkflowException("Issue already has a pending advice request")

    # request workflow
    workflow = RequestInformationWorkflow(
        incident=incident,
        actioned_user=user,
        comment=comment,
        # assigned_user=assignee
    )
    workflow.save()

    status = IncidentStatus(
        current_status=StatusType.INFORMATION_REQESTED,
        previous_status=incident.current_status,
        incident=incident,
        approved=True
    )
    status.save()

    # incident.linked_individuals.add(assignee)
    incident.save()

    # information requested email and sms
    print("sending information requested email and sms")
    subject = "Your Request Need Information"
    message = """Your request requires further information to proceed.
Ref ID: {0}
To check status:
{1}/report/status?refId={0}""".format(incident.refId, settings.APP_BASE_URL)

    send_incident_changed_email_sms(incident, subject, message)

    event_services.update_workflow_event(user, incident, workflow)


def incident_provide_information(user: User, incident: Incident, comment: str, start_event: Event):
    # if not Incident.objects.filter(linked_individuals__id=user.id).exists():
    #     raise WorkflowException("User not linked to the given incident")

    # if incident.current_status != StatusType.INFORMATION_REQESTED.name:
    #     raise WorkflowException("Incident does not have pending advice requests")

    initiated_workflow = start_event.refered_model

    # workflow
    workflow = ProvideInformationWorkflow(
        incident=incident,
        actioned_user=user,
        comment=comment,
        initiated_workflow=initiated_workflow
    )
    workflow.save()

    # complete previous workflow
    initiated_workflow.is_information_provided = True
    initiated_workflow.save()

    if (incident.current_status != StatusType.ACTION_PENDING.name and not has_pending_information_request(incident)) :
        status = IncidentStatus(
            current_status=StatusType.INFORMATION_PROVIDED,
            previous_status=incident.current_status,
            incident=incident,
            approved=True
        )
        status.save()

    # check this
    # incident.linked_individuals.remove(user.id)

    event_services.update_linked_workflow_event(user, incident, workflow, start_event)

def incident_verify(user: User, incident: Incident, comment: str, proof: bool):
    if not (incident.current_status == StatusType.NEW.name or \
            incident.current_status == StatusType.REOPENED.name):
        raise WorkflowException("Can only verify unverified incidents")

    if incident.assignee != user:
        raise WorkflowException("Only assignee can verify the incident")

    # create workflow action
    workflow = VerifyWorkflow(
        incident=incident,
        actioned_user=user,
        comment=comment,
        has_proof=proof
    )
    workflow.save()

    status = IncidentStatus(
        current_status=StatusType.VERIFIED,
        previous_status=incident.current_status,
        incident=incident,
        approved=True
    )
    status.save()

    if proof :
        incident.proof = True
        incident.save()

    event_services.update_workflow_event(user, incident, workflow)

def incident_invalidate(user: User, incident: Incident, comment: str):
    if not (incident.current_status == StatusType.NEW.name or \
            incident.current_status == StatusType.REOPENED.name):
        raise WorkflowException("Only NEW or REOPENED incidents can be invalidated")

    # workflow
    workflow = InvalidateWorkflow(
        incident=incident,
        actioned_user=user,
        comment=comment
    )
    workflow.save()

    status = IncidentStatus(
        previous_status=incident.current_status,
        current_status=StatusType.INVALIDATED,
        incident=incident,
        approved=True
    )
    status.save()

    event_services.update_workflow_event(user, incident, workflow)

def incident_reopen(user: User, incident: Incident, comment: str):
    if incident.current_status != StatusType.CLOSED.name:
        raise WorkflowException("Only CLOSED incidents can be invalidated")

    # workflow
    workflow = ReopenWorkflow(
        incident=incident,
        actioned_user=user,
        comment=comment
    )
    workflow.save()

    status = IncidentStatus(
        previous_status=incident.current_status,
        current_status=StatusType.REOPENED,
        incident=incident,
        approved=True
    )
    status.save()

    event_services.update_workflow_event(user, incident, workflow)

def get_police_report_by_incident(incident: Incident):
    try:
        incident_police_report = IncidentPoliceReport.objects.get(incident=incident)
        # if incident_police_report is None:
        #     raise IncidentException("No police report associated to the incident")
    except:
        # raise IncidentException("No police report associated to the incident")
        return None

    return incident_police_report

def get_incidents_to_escalate():

    sql = """
        SELECT b.incident_id, b.current_status, b.created_date
            FROM incidents_incidentstatus b
            INNER JOIN (
              SELECT i.incident_id, max(i.created_date) cdate
              FROM incidents_incidentstatus i
              GROUP BY i.incident_id
            ) c
            ON c.incident_id = b.incident_id AND c.cdate = b.created_date
     	WHERE b.`created_date` >  NOW() - interval 120 minute AND
                b.`current_status` <> 'CLOSED' AND
                b.`current_status` <> 'ACTION_PENDING' AND
                b.`current_status` <> 'NEW' AND
                b.`current_status` <> 'INFORMATION_REQESTED'
    """

    with connection.cursor() as cursor:
        cursor.execute(sql)
        incidents = cursor.fetchall()

        return incidents

def auto_escalate_incidents():

    incident_details = get_incidents_to_escalate()

    for incident_detail in incident_details :
        incident = get_incident_by_id(incident_detail[0])
        incident_escalate(incident.assignee, incident)

    return incident_details

def attach_media(user:User, incident:Incident, uploaded_file:File):
    """ Method to indicate media attachment """
    event_services.media_attached_event(user, incident, uploaded_file)

def get_fitlered_incidents_report(incidents: Incident, output_format: str):

    sql = """
            SELECT i.refId,g.name,i.city,DATE_FORMAT(i.created_date,'%Y-%m-%d') as submitted_date, f.name as channel, i.current_status, i.current_severity, i.response_time, d.sub_category as category
                FROM incidents_incident i
                LEFT JOIN (
                  SELECT c.id, c.sub_category
                  FROM common_category c
                ) d
                ON d.id = i.category
                LEFT JOIN (
                    SELECT e.id, e.name FROM common_channel e
                ) f
                ON f.id = i.infoChannel
                LEFT JOIN (
                    SELECT r.id, r.name FROM incidents_reporter r
                ) g
                ON g.id = i.reporter_id
        """
    incidentList=[]
    for incident in incidents:
        mode_of_receipt=Channel.objects.get(pk=incident.infoChannel)
        category=Category.objects.get(pk=incident.category)
        incidentList.append([incident.refId,incident.reporter.name, incident.city, incident.created_date.strftime('%Y-%m-%d'), mode_of_receipt.name,incident.current_status, incident.current_severity,incident.response_time,category.sub_category])
    dataframe = pd.DataFrame(incidentList)
    dataframe.columns = ["Ref ID", "Reporter Name", "City", "Submitted Date", "Mode of receipt", "Status", "Priority", "Response Time", "Category"]

    if output_format == "csv":
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename=incidents.csv'
        dataframe.to_csv(path_or_buf=response,sep=';',float_format='%.2f',index=False,decimal=",")
        return response

    if output_format == "html":
        # output = dataframe.to_html(float_format='%.2f',index=False)
        output = write_to_html_file(dataframe, "Incidents")
        output = output.encode('utf-8')

        response = HttpResponse(content_type='text/html')

        # response = HttpResponse(content_type='application/pdf')
        # response['Content-Disposition'] = 'attachment; filename="incidents.pdf"'
        # pisa.CreatePDF(output, dest=response)
        # pisa.CreatePDF(output.encode('utf-8'), dest=response)
        # pisa.CreatePDF(output.encode("ISO-8859-1"), dest=response)
        # return response

        return HttpResponse(output)

    # if it's an unrecognized format, raise exception
    raise IncidentException("Unrecognized export format '%s'" % output_format)

def write_to_html_file(df, title=''):
    '''
    Write an entire dataframe to an HTML file with nice formatting.
    '''

    result = '''
<html>
<head>
<meta charset="UTF-8">
<style>

    @media print
    {
        button
        {
            display: none !important;
        }
    }

    h2 {
        text-align: center;
    }
    table {
        margin-left: auto;
        margin-right: auto;
    }
    table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
    }
    th, td {
        padding: 5px;
        text-align: center;
        font-size: 90%;
    }
    table tbody tr:hover {
        background-color: #dddddd;
    }
    .wide {
        width: 90%;
    }

</style>
</head>
<body>
    <button onclick="window.print();return false;"> Print </button>
    '''
    result += '<h2> %s </h2>\n' % title
    result += df.to_html(classes='wide', escape=False)
    result += '''
</body>
</html>
'''
    return result

def get_incident_by_reporter_unique_id(unique_id):
    try:
        reporter = Reporter.objects.get(unique_id=unique_id)
        if reporter is None:
            raise IncidentException("Invalid unique id")

        incident = Incident.objects.get(reporter=reporter)
    except:
        raise IncidentException("Invalid unique id")

    return incident

def send_canned_response(user, incident, canned_response_id):
    try:
        selected_response = CannedResponse.objects.get(id=canned_response_id)
        if selected_response is None:
            raise WorkflowException("Invalid response id")

        workflow = SendCannedResponseWorkflow(
            incident=incident,
            actioned_user=user,
            canned_response=selected_response
        )
        workflow.save()

        event_services.update_workflow_event(user, incident, workflow)

    except Exception as e:
        print(e)
        raise WorkflowException("Unable to send the canned response")

    return incident
