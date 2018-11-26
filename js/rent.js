// Make an array to mirror Date.getDay.
const weekday = [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ];

// Make an object hash to reference either weekly day numbers or fortnightly.
const cycles = { "weekly": 7,
            "fortnightly": 14,
            "monthly": 365/12 
            }

function drawTableHeader() {
    $('#result tbody').append('<tr><th>From</th><th>To</th><th>Days</th><th>Amount</th></tr>');
}

// Add a defined number of days to a date.
function addDays (mydate, days) {
    var value = mydate.valueOf();
    // 86400000 ms in a day.
    value += 86400000 * days;
    return new Date(value);
}

// Generate how many days in the first cycle.
function firstCycleDays (start, duedate) {
    var clientDate = new Date(start);

    // Get the date numbers of each weekday.
    var duedateNum = weekday.indexOf(duedate); 
    var startdateNum = clientDate.getDay();

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
    $('#result tbody').append(`<tr><td>${a}</td><td>${b}</td><td>${c}</td><td>${d}</td></tr>`);
}

// Function to display proper money value with $ sign & 2 decimal places.
function convertMoney(amount) {
    return `$${amount.toFixed(2).toString()}`;
}

// Function to display days in rounded format for Monthly payment
function convertDays(days) {
    return parseInt(days);
}

// Function to display the suffix of the date 
function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + "st";
    }
    if (j == 2 && k != 12) {
        return i + "nd";
    }
    if (j == 3 && k != 13) {
        return i + "rd";
    }
    return i + "th";
}

// Function to display date in a nicer format
// August, 9th 2019
function convertDate(rentDate) {
    const monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

    const myMonth = monthNames[rentDate.getMonth()];
    const myDay = ordinal_suffix_of(rentDate.getDate());
    const myYear = rentDate.getFullYear();

    return `${myMonth}, ${myDay} ${myYear}`;
}

function processRent(res) {
    try {
        // API DATA
        let start = res.start_date;
        let end = res.end_date;
        let duedate = res.payment_day;
        let cycle = res.frequency;
        let rent = res.rent;

        // printBillingCycle('Start Date', 'End Date', 'dates', 'Due money');

        // FIRST CYCLE
        let cycleStart = new Date(start);
        let days = firstCycleDays(start, duedate);
        let cycleEnd = addDays(cycleStart, days - 1); // To account for the first day
        let duemoney = rent/cycles[cycle]*days;

        printBillingCycle(convertDate(cycleStart), convertDate(cycleEnd), convertDays(days), convertMoney(duemoney));


        // SUBSEQUENT CYCLES
        // If I add another billing cycle, will it be less than the end date.
        while ( addDays(cycleEnd, days) <= new Date(end) ) {
            cycleStart = addDays(cycleEnd, 1); // Day after last cycle
            days = cycles[cycle];
            cycleEnd = addDays(cycleStart, days - 1);
            duemoney = rent/cycles[cycle]*days;

            printBillingCycle(convertDate(cycleStart), convertDate(cycleEnd), convertDays(days), convertMoney(duemoney));
        }

        // LAST CYCLE
        cycleStart = addDays(cycleEnd, 1); // Day after last cycle
        days = (new Date(end) - cycleEnd)/86400000;
        cycleEnd = new Date(end);
        duemoney = rent/cycles[cycle]*days;
        if ( days != 0 ) {
            printBillingCycle(convertDate(cycleStart), convertDate(cycleEnd), convertDays(days), convertMoney(duemoney));
        }
    } catch {
        $('#result tbody').append("Your Request could not be processed");
    }
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
                console.log(res);
                $('#result tbody').empty();
                drawTableHeader();
                processRent(res);
            },
            error: function() { 
                $('#result tbody').empty();
                $('#result tbody').append("Your request was unable to be processed");
            } 
        });

    });
    
});