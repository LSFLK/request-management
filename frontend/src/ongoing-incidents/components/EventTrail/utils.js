import moment from 'moment';

export function getDateDiff(event){
    const hours = moment(new Date().getTime()).diff(event, "hours");

    if(hours < 24){
        if(hours === 0){
            return "a moment ago";
        }
        return `${hours} hours ago`;
    }else if(hours < 720){
        const days = moment(new Date().getTime()).diff(event, "days");
        return `${days} days ago`;
    }else if(hours < 8640){
        const months = moment(new Date().getTime()).diff(event, "months");
        return `${months} months ago`; 
    }else{
        const years = moment(new Date().getTime()).diff(event, "years")
        return `${years} years ago`;
    }
}

export function  calculateDeadline(incident){

    let deadline = moment(incident.dueDate)
    let timeLeft = deadline.fromNow(true)

    if(moment()<=deadline){
        return {
            status: 'PENDING',
            text:`${deadline.format('llll')}, (${timeLeft} left)`
        }
    }else{
        return {
            status: 'OVERDUE',
            text: `${deadline.format('llll')}, (overdue in ${timeLeft})`
        }
    }
}