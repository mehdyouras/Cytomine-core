var LoginDialogView = Backbone.View.extend({
   tagName : "div",
   initialize: function(options) {
   },
   doLayout: function(tpl) {
      var dialog = new ConfirmDialogView({
         el:'#dialogs',
         template : _.template(tpl, {version : window.app.status.version}),
         dialogAttr : {
            dialogID : "#login-confirm",
            backdrop : false
            /*width : 350,
            height : 350,
            buttons: {
               "Sign in": function() {
                  $('#login-form').submit();

               }
            },
            close :function (event) {
               //window.location = "403";
            }*/
         }
      }).render();

      $("#j_username").click(function() {
         $(this).select();
      });
      $("#j_password").click(function() {
         $(this).select();
      });
      $('#login-form').submit(window.app.controllers.auth.doLogin);
      $('#login-form').keydown(function(e){
         if (e.keyCode == 13) { //ENTER_KEY
            $('#login-form').submit();
            return false;
         }
      });
      return this;
   },
   render: function() {
      var self = this;
      require(["text!application/templates/auth/LoginDialog.tpl.html"], function(tpl) {
         self.doLayout(tpl);
      });
   },
   close : function() {
      $('#login-form').close();
   }
});