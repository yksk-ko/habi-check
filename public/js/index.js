$(function () {

  var id = getUrlParameter("id");
  if (id != null) {
    $("#id").val(id);
  }

  var token = getUrlParameter("token");
  if (token != null) {
    $("#token").val(token);
  }

  // search for table by input val 
  $(".search").keyup(function () {
    var searchTerm = $(".search").val();
    var listItem = $('.results tbody').children('tr');
    var searchSplit = searchTerm.replace(/ /g, "'):containsi('")

    $.extend($.expr[':'], {
      'containsi': function (elem, i, match, array) {
        return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
      }
    });

    $(".results tbody tr").not(":containsi('" + searchSplit + "')").each(function (e) {
      $(this).attr('visible', 'false');
    });

    $(".results tbody tr:containsi('" + searchSplit + "')").each(function (e) {
      $(this).attr('visible', 'true');
    });

    showItemsCount();
  });

  function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  };

  // show items count
  function showItemsCount() {
    var jobCount = getItemsCount();
    $('.counter').text(jobCount + ' item');

    if (jobCount == '0') { $('.no-result').show(); }
    else { $('.no-result').hide(); }
  }

  // get displayed items count  
  function getItemsCount() {
    var count = $('tbody tr').filter(function () {
      return $(this).css('display') !== 'none';
    }).length;
    return count;
  }

  // callApi Method
  function callAPI(option, sucessHandler, faildHandler) {
    $.ajax(option)
      .done((data) => {
        sucessHandler(data);
      })
      .fail((XMLHttpRequest, textStatus, errorThrown) => {
        console.log(XMLHttpRequest.status);
        console.log(textStatus);
        console.log(errorThrown);
        faildHandler(XMLHttpRequest, textStatus, errorThrown);
      })
  }

  // get error message
  function getErrorMes(XMLHttpRequest, textStatus, errorThrown) {
    return "(" + XMLHttpRequest.status + ")" + errorThrown;
  }

  function getWarningLevel(deadLine) {
    var diff = getDateDiff(deadLine);
    if (diff >= -3) {
      return "warning";
    } else if (diff >= -7) {
      return "caution";
    }
  }

  $("#shown_completed").on("change", function () {
    if ($(this).is(':checked')) {
      $("tr.complete").show();
    } else {
      $("tr.complete").hide();
    }
    showItemsCount();
  })

  // register btn onClick Events
  $("#register").on("click", function (event) {
    var description = $('#register-task [name=description]').val();
    var note = (description != null) ? description : "";
    var membersOpt = {
      url: "https://habitica.com/api/v3/tasks/challenge/2cc7622d-fb30-4230-8adb-3f2137a47b86",
      type: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-user": $("#id").val(),
        "x-api-key": $("#token").val()
      },
      data: JSON.stringify({
        "type": "todo",
        "text": $('#register-task [name=title]').val(),
        "notes": note,
        "date": $('#register-task [name=date]').val()
      })
    };
    callAPI(membersOpt, function (_data) {
      window.alert("Task Registration Completed!!");
    }, function (XMLHttpRequest, textStatus, errorThrown) {
      window.alert(getErrorMes(XMLHttpRequest, textStatus, errorThrown));
    });
  });

  // show btn onClick Events
  $("#show_btn").on("click", function (event) {
    var id = $("#id").val();
    var token = $("#token").val();
    var membersOpt = {
      url: "https://habitica.com/api/v3/challenges/2cc7622d-fb30-4230-8adb-3f2137a47b86/members/",
      type: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-user": id,
        "x-api-key": token
      }
    };
    callAPI(membersOpt, function (data) {
      for (var dat of data.data) {
        var url = "https://habitica.com/api/v3/challenges/2cc7622d-fb30-4230-8adb-3f2137a47b86/members/" + dat.id
        var memberOpt = {
          url: url,
          type: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-user": id,
            "x-api-key": token
          }
        }
        callAPI(memberOpt, function (data) {
          var user = data.data.profile.name
          for (var task of data.data.tasks) {
            if (task.type != "todo") {
              continue;
            }
            var className = task.completed ? "complete" : "incomplete";
            var deadLine = task.date != null ? formatDate(new Date(task.date), "YYYY/MM/DD") : "-";
            if (!task.completed) {
              className = className + " " + getWarningLevel(deadLine);
            }
            var row = "<tr class='" + className + "'><td class='name'>" + user + "</td><td>" + task.text + "</td><td>" + task.completed + "</td><td>" + deadLine + "</td></tr>";
            $("#task_table > tbody:last-child").append(row);
          }
          if (!$("#shown_completed").is(':checked')) {
            $("tr.complete").hide();
          }
          showItemsCount();
        }, function (XMLHttpRequest, textStatus, errorThrown) {
          window.alert(getErrorMes(XMLHttpRequest, textStatus, errorThrown));
        });
      }
    }, function (XMLHttpRequest, textStatus, errorThrown) {
      window.alert(getErrorMes(XMLHttpRequest, textStatus, errorThrown));
    });
  });
});