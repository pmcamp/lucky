
var lucky = (function (){

  this.speed = 50;
  this.intervalID;
  this.currentTicket;

  var db;
  var _tickets = [];

  this.initDB = function() {
    db = openDatabase("lucky", "1.0", "lucky draw", 1000);
    db.transaction(function(tx) {
      tx.executeSql("CREATE TABLE IF NOT EXISTS names (id INTEGER PRIMARY KEY ASC, name TEXT unique, status INTEGER)");
    });
  }

  this.import_data = function(tickets) {
    db.transaction(function (tx) {
      for (i=0; i< tickets.length; i++)
        tx.executeSql('INSERT INTO names (name, status) VALUES (?, 0)', [ tickets[i] ]);
    });
  }

  this.flush = function() {
    db.transaction(function (tx) {
      tx.executeSql('DELETE FROM names');
    });
    this.showAllTickets();
  }

  this.tickets = function(){
    if(_tickets.length == 0){
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM names WHERE status = 0', [], function (tx, results) {
          var len = results.rows.length, i;
          for (i = 0; i < len; i++){
            _tickets.push(results.rows.item(i).name);
          }
        });
      });
    }
    return _tickets;
  }

  this.showAllTickets = function(){
    $('#tickets').empty();
    db.transaction(function (tx) {
      tx.executeSql('SELECT * FROM names', [], function (tx, results) {
        var len = results.rows.length, i, ticket;
        for (i = 0; i < len; i++){
          ticket = results.rows.item(i);
          $('#tickets').append('<tr><td>'+ticket.name+'</td><td>'+ticket.status+'</td></tr>');
        }
      });
    });
  }

  this.lucky_names = function(){
    db.transaction(function (tx) {
      tx.executeSql('SELECT * FROM names WHERE status = 1', [], function (tx, results) {
        var len = results.rows.length, i;
        for (i = 0; i < len; i++)
          $('#lucky-names').append('<li>'+results.rows.item(i).name+'</li>');
      });
    });
  }

  this.rolling = function(){
    var name = this.tickets()[rand(this.tickets().length)];
    db.transaction(function(tx) {
      tx.executeSql("SELECT * FROM names WHERE name = ? AND status = 1", [name], function(tx, result) {
        if( result.rows.length > 0 ){
          return;
        }else{
          $('#random').text(name);
          this.currentTicket = name;
        }
      }, null);
    });
  }

  this.startRolling = function(){
    this.intervalID = setInterval(this.rolling, this.speed);
  }

  this.stopRolling = function(){
    db.transaction(function(tx) {
      tx.executeSql("UPDATE names SET status=? WHERE name = ?", [1, this.currentTicket]);
    });

    clearInterval(this.intervalID);
    $('#lucky-names').append('<li>'+this.currentTicket+'</li>');
  };

  return this;
})();

$(function(){

  $('#lucky-draw').height(Math.max($(window).height(), $('#lucky-draw').height()));

  lucky.initDB();

  lucky.lucky_names();

  lucky.showAllTickets();

  var KEY = { ESC: 27, I: 73 };

  $('body').delegate('#import-button', 'click', function(event){
    var list_str = $('#data-source').val();
    var names = [];
    var list_lines = list_str.split("\n");
    for (var i = 0; i < list_lines.length; i++) {
      var name = $.trim(list_lines[i]);
      if (name != "") names.push(name);
    }
    lucky.import_data(names);
    lucky.showAllTickets();
  });

  $('#lucky-button').toggle(
    function(){
      $(this).val('停 止');
      lucky.startRolling();
    },
    function(){
      $(this).val('开 始');
      lucky.stopRolling();
    }
  );

});


