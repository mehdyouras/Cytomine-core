var EditProjectDialog = Backbone.View.extend({
    projectsPanel : null,
    editProjectDialog : null,
    initialize: function(options) {
        this.container = options.container;
        this.projectPanel = options.projectPanel;
        _.bindAll(this, 'render');
    },
    render : function() {
        var self = this;
        require([
            "text!application/templates/project/ProjectEditDialog.tpl.html",
            "text!application/templates/project/UsersChoices.tpl.html"
        ],
               function(projectEditDialogTpl, usersChoicesTpl) {
                   self.doLayout(projectEditDialogTpl, usersChoicesTpl);
               });
        return this;
    },
    doLayout : function(projectEditDialogTpl, usersChoicesTpl) {

        var self = this;
        $("#editproject").replaceWith("");
        $("#addproject").replaceWith("");
        var dialog = _.template(projectEditDialogTpl, {});
        $(self.el).append(dialog);

        $("#login-form-edit-project").submit(function () {
            self.editProject();
            return false;
        });
        $("#login-form-edit-project").find("input").keydown(function(e) {
            if (e.keyCode == 13) { //ENTER_KEY
                $("#login-form-edit-project").submit();
                return false;
            }
        });

        $("#projectedituser").empty();
        window.app.models.users.each(function(user) {
            var choice = _.template(usersChoicesTpl, {id:user.id,username:user.get("username")});
            $("#projectedituser").append(choice);
        });

        //Build dialog
        console.log("EditProjectDialog: build dialog");
        self.editProjectDialog = $("#editproject").dialog({
            width: 500,
            autoOpen : false,
            modal:true,
            buttons : {
                "Save" : function() {
                    $("#login-form-edit-project").submit();
                },
                "Cancel" : function() {
                    $("#editproject").dialog("close");
                }
            }
        });
        self.open();
        self.fillForm();
        return this;

    },
    fillForm : function() {
        console.log("fillForm");
        var self = this;
        $("#project-edit-name").val(self.model.get('name'));
        var jsonuser = self.model.get('users');
        _.each(jsonuser,
              function(user){
                  console.log(user + " " + $('#users'+user).length);
                  $('#users'+user).attr('checked', true);
                  //TODO: if user.id == currentuser, lock the checkbox (a user cannot delete himself from a project)
                  if(window.app.status.user.id==user.id) {

                  }
              });

    },
    refresh : function() {
    },
    open: function() {
        var self = this;
        self.clearEditProjectPanel();
        self.editProjectDialog.dialog("open");
    },
    clearEditProjectPanel : function() {
        var self = this;
        console.log($(self.el).html());
        $("#projectediterrormessage").empty();
        $("#projectediterrorlabel").hide();
        $("#project-edit-name").val("");

        $(self.editProjectCheckedUsersCheckboxElem).attr("checked", false);
    },
    /**
     * Function which returns the result of the subtraction method applied to
     * sets (mathematical concept).
     *
     * @param a Array one
     * @param b Array two
     * @return An array containing the result
     */
    diffArray: function(a, b) {
        var seen = [], diff = [];
        for ( var i = 0; i < b.length; i++)
            seen[b[i]] = true;
        for ( var i = 0; i < a.length; i++)
            if (!seen[a[i]])
                diff.push(a[i]);
        return diff;
    },


    editProject : function() {
        console.log("editProject...");
        var self = this;

        $("#projectediterrormessage").empty();
        $("#projectediterrorlabel").hide();

        var name = $("#project-edit-name").val().toUpperCase();;
        var users = new Array();

        $('input[type=checkbox][name=usercheckbox]:checked').each(function(i, item) {
            users.push($(item).attr("value"))
        });

        //edit project
        var project = self.model;
        project.set({name:name});

        project.save({name : name}, {
            success: function (model, response) {
                console.log(response);

                window.app.view.message("Project", response.message, "");

                var id = response.project.id;
                console.log("project=" + id);
                //create user-project "link"


                var projectOldUsers = new Array(); //[a,b,c]
                var projectNewUsers = null;  //[a,b,x]
                var projectAddUser = null;
                var projectDeleteUser = null;

                var jsonuser = self.model.get('users');

                _.each(jsonuser,
                      function(user){
                          projectOldUsers.push(user)
                      });
                projectOldUsers.sort();
                projectNewUsers = users;
                projectNewUsers.sort();
                //var diff = self.diffArray(projectOldUsers,projectNewUsers);
                projectAddUser = self.diffArray(projectNewUsers,projectOldUsers); //[x] must be added
                projectDeleteUser =  self.diffArray(projectOldUsers,projectNewUsers); //[c] must be deleted

                console.log("projectOldUsers");
                _.each(projectOldUsers,function(user){console.log(user)});
                console.log("projectNewUsers");
                _.each(projectNewUsers,function(user){console.log(user)});
                console.log("projectAddUser");
                _.each(projectAddUser,function(user){console.log(user)});
                console.log("projectDeleteUser");
                _.each(projectDeleteUser,function(user){console.log(user)});
                var total = projectAddUser.length+projectDeleteUser.length;
                var counter = 0;
                _.each(projectAddUser,function(user){
                    console.log("projectAddUser="+user);
                    new ProjectUserModel({project: id,user:user}).save({}, {
                        success: function (model, response) {
                            self.addDeleteUserProjectCallback(total,++counter);
                        },error: function (model, response) {
                            console.log(response);
                            var json = $.parseJSON(response.responseText);
                            window.app.view.message("User", json.errors, "");
                        }});
                });
                _.each(projectDeleteUser,function(user){
                    console.log("projectDeleteUser="+user);
                    new ProjectUserModel({project: id,user:user}).destroy({
                        success: function (model, response) {
                            self.addDeleteUserProjectCallback(total,++counter);
                        },error: function (model, response) {
                            console.log(response);
                            var json = $.parseJSON(response.responseText);
                            window.app.view.message("User", json.errors, "");
                        }});
                });

            },
            error: function (model, response) {
                var json = $.parseJSON(response.responseText);
                console.log("json.project=" + json.errors);

                $("#projectediterrorlabel").show();

                console.log($("#projectediterrormessage").append(json.errors));
            }
        }
                );
    },
    addDeleteUserProjectCallback : function(total, counter) {
        if (counter < total) return;
        var self = this;
        self.projectPanel.refresh();
        $("#editproject").dialog("close");
    }
});