var baseUrl = 'http://localhost:2000/';

function connectMysqlDB() {
    var host = $('#host').val();
    var port = $('#port').val();
    var user = $('#user').val();
    var password = $('#password').val();
    var database = $('#database').val();

    if (isNull(host)) {
        alert('Please enter host name');
        return;
    } else if (isNull(port)) {
        alert('Please enter port number');
        return;
    } else if (isNull(database)) {
        alert('Please enter database name');
        return;
    } else if (isNull(user)) {
        alert('Please enter username');
        return;
    } else if (isNull(password)) {
        alert('Please enter password');
        return;
    }

    var data = {
        host: host,
        port: port,
        user: user,
        password: password,
        database: database
    };

    showLoading();

    $.ajax({
        method: "POST",
        url: baseUrl + "mysql/connect",
        data: data,
        success: function (result) {
            hideLoading();
            if (result == "success") {
                location.href = "destination";
            } else {
                alert(result);
            }
        }, error: function (err) {
            hideLoading();
            alert(err);
        }
    });
}


function connectMongoDB() {
    var host = $('#host').val();
    var port = $('#port').val();
    var user = $('#user').val();
    var password = $('#password').val();
    var database = $('#database').val();

    if (isNull(host)) {
        alert('Please enter host name');
        return;
    } else if (isNull(port)) {
        alert('Please enter port number');
        return;
    } else if (isNull(database)) {
        alert('Please enter database name');
        return;
    } else if (isNull(user)) {
        alert('Please enter username');
        return;
    } else if (isNull(password)) {
        alert('please enter password');
        return;
    }

    var data = {
        host: host,
        port: port,
        user: user,
        password: password,
        database: database
    };

    showLoading();

    $.ajax({
        method: "POST",
        url: baseUrl + "mongodb/connect",
        data: data,
        success: function (result) {
            hideLoading();
            if (result == "success") {
                location.href = "list";
            } else {
                alert(result);
            }
        }, error: function (err) {
            alert(err);
            hideLoading();
        }
    });
}

function doMigrate() {
    $('.status').html('Started');
    $('.statusWholeDiv').css('display', 'block');
    $('#migrate').prop('disabled', true);
    $.ajax({
        method: "GET",
        url: baseUrl + "mongodb/migrate",
        success: function (result) {
            getStatus();
        }
    });
}

function getStatus() {
    $.ajax({
        method: "GET",
        url: baseUrl + "status",
        success: function (result) {
            var tableCount = $('#tableCount').val();
            $('#count').html(tableCount);
            $.each(result.tables, function (i, row) {
                var progress = ((i + 1) * 100) / tableCount;
                $('#progress').css('width', (progress + "%"));
                $('#percentage').html(' (' + Math.round(progress) + '%)');
                $('#completed').html(i + 1);
                $('#' + row).html('Completed');
                if (i >= tableCount - 1) {
                    clearTimeout(timer);
                    alert('Migrated Successfully');
                    $('#migrate').prop('disabled', false);
                    return;
                }
            })
        }
    });
    var timer = setTimeout(function () {
        getStatus();
    }, 3000);
}

function iscCheckboxSelected(event) {
    if ($("input[type=checkbox]:checked").length === 0) {
        event.preventDefault();
        alert('Please select at least one table');
        return false;
    }
}

function selectAll(master, group) {
    var array = document.getElementsByName(group);
    for (var i = 0; i < array.length; i++) {
        array[i].checked = master.checked;
    }
}

function showLoading() {
    $('#loading').addClass('loading');
}

function hideLoading() {
    $('#loading').removeClass('loading');
}

function isNull(value) {
    return (value == "") ? true : false;
}





