"""Reports"""

from django.db import connection
import pandas as pd
import numpy as np
from datetime import date, timedelta, datetime, time
from django.utils.timezone import get_current_timezone
from django.utils.dateparse import parse_datetime

from ..custom_auth.models import Profile, Organization
from ..common.models import Category, Channel, District
from ..incidents.models import Incident, IncidentType, CloseWorkflow, StatusType
from ..incidents.services import get_incident_by_id
from .functions import get_detailed_report, get_general_report, encode_column_names, get_subcategory_report, \
    incident_type_query, incident_list_query, date_list_query, encode_value, get_subcategory_categorized_report
from ..common.data.Institutions import institutions
# from django.conf import settings
from django.db.models import Count
import collections, functools, operator
from django.contrib.auth import get_user_model

User = get_user_model()

def get_total_opened_incident_count():
    count = Incident.objects.exclude(current_status=StatusType.CLOSED.name).exclude(current_status=StatusType.INVALIDATED.name).count()
    return count

def get_daily_incidents(actionType = "OPENED"):
    """ List dialy incidents to the current date """

    current_date = datetime.now(tz=get_current_timezone())
    start_date = current_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_date = start_date + timedelta(1)

    if (actionType == "CLOSED"):
        incidents = []
        closeIncidents = CloseWorkflow.objects.filter(created_date__range=(start_date, end_date))
        for incident in closeIncidents:
            incidents.append(incident.incident)
    else:
        incidents = Incident.objects.filter(created_date__range=(start_date, end_date))

    return incidents

def get_weekly_incidents(actionType = "OPENED"):
    """ List weekly incident from Sunday through Saturday of the current week. """

    current_date = datetime.now(tz=get_current_timezone())
    start_date = current_date - timedelta(current_date.weekday())
    end_date = start_date + timedelta(6)

    if (actionType == "CLOSED"):
        incidents = []
        closeIncidents = CloseWorkflow.objects.filter(created_date__range=(start_date, end_date))
        for incident in closeIncidents:
            incidents.append(incident.incident)
    else:
        incidents = Incident.objects.filter(created_date__range=(start_date, end_date))

    week_data = {}
    week_data["incidents"] = incidents
    week_data["start_date"] = start_date.strftime("%Y-%m-%d")
    week_data["end_date"] = end_date.strftime("%Y-%m-%d")
    return week_data

def parse_date_timezone(datetimeValue):
    """ parsing string datetime (eg: '2020-04-20 06:00:00') to date with timezone for accurate search """

    datetimeValue = get_current_timezone().localize(parse_datetime(datetimeValue))
    return datetimeValue


def get_category_dict(incidents):
    """returns the category dictionary with counts on given incidents"""

    # get incident count per category
    category_count = {}
    for incident in incidents:
        if incident.category in category_count:
            category_count[incident.category] += 1
        else:
            category_count[incident.category] = 1

    # collecting all category data
    category_dict = []
    categories = Category.objects.all()

    temp_category_dict = {}
    top_categories = []
    for category in categories:
        if category.top_category in temp_category_dict:
            sub_cat = {}
            sub_cat["nameEnglish"] = category.sub_category
            sub_cat["nameSinhala"] = category.sn_sub_category
            sub_cat["nameTamil"] = category.tm_sub_category
            if str(category.id) in category_count:
                sub_cat["count"] = category_count[str(category.id)]
            else:
                sub_cat["count"] = 0
            temp_category_dict[category.top_category]["subCategories"].append( sub_cat)
        else:
            top_cat = {}
            top_cat["categoryNameEnglish"] = category.top_category
            top_cat["categoryNameSinhala"] = category.sn_top_category
            top_cat["categoryNameTamil"] = category.tm_top_category
            top_categories.append(category.top_category)

            sub_cat = {}
            sub_cat["nameEnglish"] = category.sub_category
            sub_cat["nameSinhala"] = category.sn_sub_category
            sub_cat["nameTamil"] = category.tm_sub_category
            if str(category.id) in category_count:
                sub_cat["count"] = category_count[str(category.id)]
            else:
                sub_cat["count"] = 0
            top_cat["subCategories"] = []
            top_cat["subCategories"].append(sub_cat)
            temp_category_dict[category.top_category] = top_cat

    for category in top_categories:
        category_dict.append(temp_category_dict[category])

    return category_dict

def get_organization_dict(incidents, actionType = "OPENED"):
    """ return organizations dict with count of incidents """

    # get organizations with incident count
    org_count = {}
    for incident in incidents:
        if actionType == "CLOSED" :
            user = CloseWorkflow.objects.get(incident_id=incident).actioned_user
        else:
            user = incident.created_by
        profile = Profile.objects.get(user=user)
        if profile.organization_id in org_count:
            org_count[profile.organization_id] += 1
        else:
            org_count[profile.organization_id] = 1

    organizations = []
    for org_id, count in org_count.items():
        orgData = {}
        org = Organization.objects.get(id=org_id)
        orgData["organizationNameEnglish"] = org.displayName
        orgData["organizationNameSinhala"] = org.sn_name
        orgData["organizationNameTamil"] = org.tm_name
        orgData["count"] = count

        organizations.append(orgData)

    return organizations

def get_daily_category_data(language="sinhala"):

    file_dict = {}
    file_dict["template"] = "/incidents/complaints/daily_summery_report_categorywise.js"
    file_dict["date"] = date.today().strftime("%Y/%m/%d")
    file_dict["language"] = language

    incidents = get_daily_incidents()
    file_dict["total"] = len(incidents)
    file_dict["totalOpenedCount"] = get_total_opened_incident_count()

    file_dict["categories"] = get_category_dict(incidents)

    return file_dict

def get_closed_daily_category_data(language="sinhala"):

    file_dict = {}
    file_dict["template"] = "/incidents/complaints/daily_closed_summery_report_categorywise.js"
    file_dict["date"] = date.today().strftime("%Y/%m/%d")
    file_dict["language"] = language

    incidents = get_daily_incidents("CLOSED")
    file_dict["total"] = len(incidents)
    file_dict["totalOpenedCount"] = get_total_opened_incident_count()

    file_dict["categories"] = get_category_dict(incidents)

    return file_dict

def get_category_data_by_date_range(start_time, end_time, language="sinhala"):

    file_dict = {}
    file_dict["template"] = "/incidents/complaints/daily_summery_report_categorywise_with_timefilter.js"
    file_dict["StartDate"] = start_time
    file_dict["EndDate"] = end_time
    file_dict["language"] = language

    incidents = Incident.objects.filter(created_date__range=(parse_date_timezone(start_time), parse_date_timezone(end_time)))
    file_dict["total"] = len(incidents)
    file_dict["totalOpenedCount"] = get_total_opened_incident_count()

    file_dict["categories"] = get_category_dict(incidents)

    return file_dict

def get_weekly_closed_complain_category_data(language="sinhala"):

    file_dict = {}
    file_dict["template"] = "/incidents/complaints/weekly_closed_request_report_categorywise.js"

    week_data = get_weekly_incidents("CLOSED")
    file_dict["StartDate"] = week_data["start_date"]
    file_dict["EndDate"] = week_data["end_date"]
    file_dict["language"] = language

    incidents = week_data["incidents"]
    file_dict["total"] = len(incidents)
    file_dict["totalOpenedCount"] = get_total_opened_incident_count()

    file_dict["categories"] = get_category_dict(incidents)

    return file_dict

def get_organizationwise_data_with_timefilter(start_time, end_time, language="sinhala"):

    file_dict = {}
    file_dict["template"] = "/incidents/complaints/summery_report_organizationwise_with_timefilter.js"
    file_dict["StartDate"] = start_time
    file_dict["EndDate"] = end_time
    file_dict["language"] = language

    incidents = Incident.objects.filter(created_date__range=(parse_date_timezone(start_time), parse_date_timezone(end_time)))
    file_dict["total"] = incidents.count()
    file_dict["totalOpenedCount"] = get_total_opened_incident_count()

    file_dict["organizations"] = get_organization_dict(incidents, "OPENED")

    return file_dict


def get_weekly_closed_complain_organization_data(language="sinhala"):

    file_dict = {}
    file_dict["template"] = "/incidents/complaints/weekly_closed_request_report_organizationwise.js"
    file_dict["date"] = date.today().strftime("%Y/%m/%d")
    file_dict["language"] = language

    week_data = get_weekly_incidents("CLOSED")
    file_dict["StartDate"] = week_data["start_date"]
    file_dict["EndDate"] = week_data["end_date"]

    incidents = week_data["incidents"]
    file_dict["organizations"] = get_organization_dict(incidents, "CLOSED")

    file_dict["total"] = len(incidents)
    file_dict["totalOpenedCount"] = get_total_opened_incident_count()

    return file_dict

def get_daily_closed_complain_organization_data(language="sinhala"):

    file_dict = {}
    file_dict["template"] = "/incidents/complaints/daily_closed_request_report_organizationwise.js"
    file_dict["date"] = date.today().strftime("%Y/%m/%d")
    file_dict["language"] = language

    start_datetime = (date.today() - timedelta(days=7)).strftime("%Y-%m-%d")
    end_datetime = date.today().strftime("%Y-%m-%d")

    incidents = get_daily_incidents("CLOSED")
    file_dict["organizations"] = get_organization_dict(incidents, "CLOSED")

    file_dict["total"] = len(incidents)
    file_dict["totalOpenedCount"] = get_total_opened_incident_count()

    return file_dict


def get_category_summary(start_date, end_date, detailed_report, complain, inquiry):
    sql3 = incident_type_query(complain, inquiry)
    incident_list = incident_list_query(start_date, end_date, sql3)
    if detailed_report:
        columns = list(
            set(Category.objects.all().values_list("top_category", flat=True)))
        columns.insert(0, "Unassigned")
        sql2 = ", ".join(
            map(
                lambda c:
                "(CASE WHEN ifnull(%s,'Unassigned') LIKE '%s' THEN 1 ELSE 0 END) AS '%s'"
                % ('top_category', c, encode_value(c)), columns))
        sql1 = """
                        SELECT district,
                                   %s
                                  ,
                                  1       AS Total
                           FROM   incidents_incident
                           LEFT JOIN common_category ON category=common_category.id
                           %s
                        """ % (sql2, incident_list)
        columns = encode_column_names(columns)
        return get_detailed_report(sql1, columns)
    return get_general_report("top_category", "Category", "common_category",
                              "category", "id", start_date, end_date, sql3)


def get_subcategory_summary(start_date, end_date, detailed_report, complain,
                            inquiry):
    sql3 = incident_type_query(complain, inquiry)
    incident_list = incident_list_query(start_date, end_date, sql3)
    if detailed_report:
        tables = ""
        for category in list(Category.objects.order_by().values_list(
                "top_category", flat=True).distinct()):
            tables += "<br><br><br><br>" + (get_subcategory_categorized_report(
                incident_list, category))
        return tables
    return get_subcategory_report("sub_category", "Subcategory",
                                  "common_category", "category", "id",
                                  start_date, end_date, sql3)


def get_mode_summary(start_date, end_date, detailed_report, complain, inquiry):
    sql3 = incident_type_query(complain, inquiry)
    incident_list = incident_list_query(start_date, end_date, sql3)
    if detailed_report:
        columns = list(
            set(Channel.objects.all().values_list("name", flat=True)))
        columns.insert(0, "Unassigned")
        sql2 = ", ".join(
            map(
                lambda c:
                "(CASE WHEN ifnull(%s,'Unassigned') LIKE '%s' THEN 1 ELSE 0 END) AS '%s'"
                % ('name', c, encode_value(c)), columns))
        sql1 = """
                SELECT district,
                           %s
                          ,
                          1       AS Total
                   FROM   incidents_incident
                   LEFT JOIN common_channel ON infoChannel=common_channel.id
                   %s
                """ % (sql2, incident_list)
        columns = encode_column_names(columns)
        return get_detailed_report(sql1, columns)
    return get_general_report("name", "Mode", "common_channel", "infoChannel",
                              "id", start_date, end_date, sql3)


def get_incident_date_summary(start_date, end_date, detailed_report, complain,
                              inquiry):
    sql3 = incident_type_query(complain, inquiry)
    incident_list = incident_list_query(start_date, end_date, sql3)
    sql = """
            SELECT incident_date as 'Incident Date',
       Total
FROM   (SELECT incident_date,
               Sum(Total) AS Total
        FROM   (SELECT Date_format(occured_date + INTERVAL 8 HOUR, '%s')
                       AS
                       incident_date
                               ,
                       '1'
                               AS Total
                FROM   incidents_incident
                %s
                UNION ALL
                SELECT selected_date,
                       '0'
                FROM   (%s) AS dateranges) AS result
        GROUP  BY result.incident_date
        ORDER  BY incident_date) AS result2
UNION
SELECT '(Total No. of Incidents)',
       Count(id)
FROM   incidents_incident
%s
            """ % ("%Y-%m-%d", incident_list,
                   date_list_query(start_date, end_date), incident_list)
    dataframe = pd.read_sql_query(sql, connection)
    dataframe = dataframe.fillna(0)
    return dataframe.to_html(index=False)


def get_district_summary(start_date, end_date, detailed_report, complain,
                         inquiry):
    sql3 = incident_type_query(complain, inquiry)
    return get_general_report("name", "District", "common_district",
                              "district", "code", start_date, end_date, sql3)


def get_severity_summary(start_date, end_date, detailed_report, complain,
                         inquiry):
    sql3 = incident_type_query(complain, inquiry)
    incident_list = incident_list_query(start_date, end_date, sql3)
    if detailed_report:
        sql1 = """
        SELECT district,
                  ( CASE
                      WHEN Ifnull(severity, 0) > 7 THEN
                      1
                      ELSE 0
                    end ) AS High,
                  ( CASE
                      WHEN Ifnull(severity, 0) > 3
                           AND Ifnull(severity, 0) < 8
                    THEN 1
                      ELSE 0
                    end ) AS Medium,
                  ( CASE
                      WHEN Ifnull(severity, 0) < 4 THEN
                      1
                      ELSE 0
                    end ) AS Low,
                  1       AS Total
           FROM   incidents_incident
           %s
        """ % incident_list
        columns = ["High", "Medium", "Low"]
        return get_detailed_report(sql1, columns)

    # if general report
    sql = """ # if general report
         SELECT    Ifnull(name,'Unassigned') AS Severity,
                   Ifnull(subtotal,0)        AS Total
         FROM      reporting_severitysegment AS d
         LEFT JOIN
                   (
                            SELECT   (
                                     CASE
                                              WHEN severity > 7 THEN 'High'
                                              WHEN severity > 3 THEN 'Medium'
                                              ELSE 'Low'
                                     END)                                           AS currentstate,
                                     Count(Ifnull(incidents_incident.severity,0)) AS subtotal
                            FROM     incidents_incident
                            %s
                            GROUP BY currentstate) AS incidents
         ON        currentstate = d.name
         UNION ALL
        SELECT '(Total No. of Incidents)',
               Count(id)
        FROM   incidents_incident
        %s
        ORDER  BY Field(Severity, 'High', 'Medium', 'Low', '(Total No. of Incidents)')
    """ % (incident_list, incident_list)
    dataframe = pd.read_sql_query(sql, connection)
    dataframe = dataframe.fillna(0)
    return dataframe.to_html(index=False)


def get_status_summary(start_date, end_date, detailed_report, complain,
                       inquiry):
    sql3 = incident_type_query(complain, inquiry)
    incident_list = incident_list_query(start_date, end_date, sql3)
    if detailed_report:
        sql1 = """
        SELECT district,(
               CASE WHEN Ifnull(current_status, 'Unassigned') LIKE 'CLOSED' THEN 1 ELSE 0 END )AS Resolved,
               (CASE WHEN Ifnull(current_status, 'Unassigned')  NOT LIKE 'CLOSED' THEN 1 ELSE 0 END )AS Unresolved,
                             1 AS Total
                      FROM   incidents_incident
                     %s
        """ % incident_list
        columns = ["Resolved", "Unresolved"]
        return get_detailed_report(sql1, columns)

    # if general report
    sql = """
        SELECT name                  AS Status,
               Ifnull(subtotal, '0') AS Total
        FROM   reporting_statussegment AS d
               LEFT JOIN (SELECT ( CASE
                                     WHEN Ifnull(current_status, 'Unassigned') LIKE
                                          'CLOSED'
                                                                       THEN
                                     'Resolved'
                                     ELSE 'Unresolved'
                                   END )                          AS currentState,
                                 Count(Ifnull(current_status, 1)) AS subtotal
                          FROM   incidents_incident
                          %s
                          GROUP  BY currentstate) AS incidents
                      ON currentstate = d.name
        UNION ALL
        SELECT '(Total No. of Incidents)',
               Count(id)
        FROM   incidents_incident
        %s
        ORDER  BY Field(status, 'Resolved', 'Unresolved', '(Total No. of Incidents)')
    """ % (incident_list, incident_list)
    dataframe = pd.read_sql_query(sql, connection)
    dataframe = dataframe.fillna(0)
    return dataframe.to_html(index=False)


def get_police_division_summary():
    sql = """
          SELECT
            incident.province,
            incident.di_division,
            incident.police_division,
            COUNT(incident.police_station) AS police_station_count,
            COUNT(incident.id) AS division_total,
            COUNT(CASE WHEN cs.current_status <> "CLOSED" THEN 1 ELSE NULL END) AS open_total,
            COUNT(CASE WHEN cs.current_status = "CLOSED" THEN 1 ELSE NULL END) AS closed_total
          FROM incidents_incident incident,
          (
            SELECT b.incident_id, b.current_status
            FROM incidents_incidentstatus b
            INNER JOIN (
              SELECT i.incident_id, max(i.created_date) cdate
              FROM incidents_incidentstatus i
              GROUP BY i.incident_id
            ) c
            ON c.incident_id = b.incident_id AND c.cdate = b.created_date
          ) AS cs
          WHERE cs.incident_id = incident.id
          GROUP BY incident.province, incident.di_division, incident.police_division
        """
    headers = [
        "Police Stations Count", "Incidents Received", "Incidents Pending",
        "Incidents Closed", "Other", "Total Count", "Province Total"
    ]
    dataframe = pd.read_sql_query(sql, connection)
    dataframe.sort_values(by=['province', 'di_division'], inplace=True)
    dataframe.set_index(['province', 'di_division', 'police_division'],
                        inplace=True)
    dataframe.fillna(value=0, inplace=True)
    dataframe["other"] = ""
    dataframe["total"] = dataframe["division_total"]
    dataframe["province_total"] = dataframe.groupby(
        'province')['total'].transform(np.sum)

    dataframe.columns = headers
    dataframe.index.names = ["Province", "DI Division", "Police Division"]

    return dataframe.to_html()
