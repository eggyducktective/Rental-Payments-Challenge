// console.log('working');

$(document).ready(function() {
    $('#mySearch').click(function(){
        let tentantId = $('#tentantId').val();

        $.ajax({
            type: 'GET',
            url: `https://hiring-task-api.herokuapp.com/v1/leases/${tentantId}`,
            dataType: 'JSON',
    
            success: function(res) {
                console.log(res);
                $('#result').html(JSON.stringify(res));
            

            }
    
        })
    })
    
})