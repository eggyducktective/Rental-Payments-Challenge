// console.log('working');

// Make an array to mirror Date.getDay.
const weekday = [ "sunday","monday","tuesday","wednesday","thursday","friday","saturday" ];

// Make an object hash to reference either weekly day numbers or fortnightly.
const cycles = { "weekly": 7,
            "fortnightly": 14,
            "monthly": 365/12
            }


// Add a defined number of days to a date.
function addDays (mydate, days) {
    var value = mydate.valueOf();
    // 86400000 ms in a day.
    value += 86400000 * days;
    return new Date(value);
}

// Generate how many days in the first cycle.
function firstCycleDays (start, weekdayStart) {
    var clientDate=new Date(start);

    // Get the date numbers of each weekday.
    var duedateNum=weekday.indexOf(weekdayStart);
    var startdateNum=clientDate.getDay();

    // Compare the difference
    var days = duedateNum - startdateNum;

    // If the difference is less that 7, we have ticked into the next week, add 7 days.
    if ( days < 0 ) {
        days = days + 7
    }
    return days;
}

// Output to your web page in this function however you would like.
function printBillingCycle(a, b, c, d) {
    // $('#result').append('| ' + a + ' | ' + b + ' | ' + c + ' | ' + d + '|' + '<br>');
    $('#result tbody').append(`<tr><td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td></tr>`);
}

function processRent(res) {
    // API DATA
    let start=res.start_date;
    let end=res.end_date;
    let duedate=res.payment_day;
    let cycle=res.frequency;
    let rent=res.rent;

    // printBillingCycle('Start Date', 'End Date', 'dates', 'Due money');

    // FIRST CYCLE
    let cycleStart = new Date(start);
    let days = firstCycleDays(start, duedate);
    let cycleEnd = addDays(cycleStart, days);
    let duemoney = rent/cycles[cycle]*days;

    printBillingCycle(cycleStart, cycleEnd, days, duemoney);


    // SUBSEQUENT CYCLES
    // If I add another billing cycle, will it be less than the end date.
    while ( addDays(cycleEnd, days) < new Date(end) ) {
        cycleStart = cycleEnd;
        days = cycles[cycle];
        cycleEnd = addDays(cycleStart, days);
        duemoney = rent/cycles[cycle]*days;

        printBillingCycle(cycleStart, cycleEnd, days, duemoney);
    }

    // LAST CYCLE
    cycleStart = cycleEnd;
    days = (new Date(end) - cycleEnd)/86400000;
    cycleEnd = new Date(end);
    duemoney = rent/cycles[cycle]*days;

    printBillingCycle(cycleStart, cycleEnd, days, duemoney);

}


$(document).ready(function() {
    $('#mySearch').click(function(){
        let tentantId = $('#tentantId').val();

        $.ajax({
            type: 'GET',
            url: `https://hiring-task-api.herokuapp.com/v1/leases/${tentantId}`,
            dataType: 'JSON',
    
            success: function(res) {
                console.log(res);
                // Test Result is there
                // $('#result').html(JSON.stringify(res));
                // Process Rent
                processRent(res);
            }
    
        });

    });
    
});