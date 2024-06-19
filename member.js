function skillsMember()
{
    var member = document.getElementById('member').value;
    var member = member.toLowerCase();
    var skills = document.getElementById('skills');
    var message = document.getElementById('message');
    var memberSkills = {
        "james": "HTML, CSS, JavaScript, PHP",
        "john": "HTML, CSS, JavaScript",
        "sarah": "HTML, CSS, JavaScript, PHP, Ruby",
        "joseph": "HTML, CSS, JavaScript, PHP, Ruby, Python"
    };
    if (member == "james" || member == "john" || member == "sarah" || member == "joseph")
    {
        skills.innerHTML = memberSkills[member];
        message.innerHTML = "";
    }
    else
    {
        skills.innerHTML = "";
        message.innerHTML = "Member not found";
    }
}