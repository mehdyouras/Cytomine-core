var CustomModal = Backbone.View.extend({
   initialize: function (options) {
       this.buttons = [];
       this.idModal = options.idModal;
       this.button = options.button;
       this.header = options.header;
       this.body = options.body;
       this.width = options.width;
       this.height = options.height;
       this.callBack = options.callBack;
       this.registerModal();

   },
   addButtons : function(id,text,primary,close,callBack) {
       this.buttons.push({id:id,text:text,close: (close?'modal':''),primaryClass:(primary? 'btn-primary' :''),callBack:callBack});
   },
   registerModal : function() {
        var self = this;
       console.log("registerModal");
       console.log(self.button.length);
        //when click on button to open modal, build modal html, append to doc and open modal
        self.button.unbind();
        self.button.click(function (evt) {

            console.log("click show modal");
//            require([
//                "text!application/templates/utils/CustomModal.tpl.html"
//            ],
//             function (tplModal) {

            var tplModal = '<div id="<%= id %>" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="width: <%= width %>px;margin-left: -<%= halfWidth %>px;min-height: <%= height %>px;"> '+
              '<div class="modal-header">'+
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
                '<h3 id="myModalLabel"><%= header %></h3>' +
              '</div>' +
              '<div class="modal-body" style="max-height: <%= height %>px;">'+
                  '<%= body %>' +
              '</div>' +
              '<div class="modal-footer">' +
                  '<% _.each(buttons, function(button) { %> ' +
                    '<button id="<%=button.id%>" class="btn <%= button.primaryClass %>" data-dismiss="<%= button.close %>" aria-hidden="true"><%= button.text %></button>'+
                  '<% }) %>'
              '</div>'+
            '</div>'





                 console.log("init modal content");
                 var modal = $("#modals");
                 console.log("remove modal content");
                 modal.empty();

                 var htmlModal = _.template(tplModal,{id:self.idModal,header:self.header,body:self.body,width:self.width,height:self.height,halfWidth:(self.width/2), buttons:self.buttons});


                 modal.append(htmlModal);

                 console.log("add button callback");
                 _.each(self.buttons,function(b) {
                     $("#"+b.id).click(function() {
                         if(b.callBack) {
                             b.callBack();
                         }
                         return true;
                     });
                 });

                 console.log("callback");
                 if(self.callBack) {
                     self.callBack();
                 }

//             });
            console.log("return");
            $("#modals").find("div").show();
            return true;
        });
    }
});

var DescriptionModal = {

    initDescriptionModal : function(container,idDescription,domainIdent, domainClassName, text,callback) {
        var width = Math.round($(window).width()*0.75);
        var height =  Math.round($(window).height()*0.75);
        console.log("initDescriptionModal");
        console.log(container.find("a.description").html());
        console.log("BEFORE:"+text);
       // text = text.split('\\"').join('"');

        console.log("AFTER:"+text);

//         text = text.split('"/api').join('/api');
//                             text = text.split('download"').join('download');

        //add host url for images
        text = text.split('/api/attachedfile').join(window.location.protocol + "//" + window.location.host+'/api/attachedfile');

         var modal = new CustomModal({
             idModal : "descriptionModal"+domainIdent,
             button : container.find("a.description"),
             header :"Description",
             body :'<div id="description'+domainIdent+'"><textarea style="width: '+(width-100)+'px;height: '+(height-100)+'px;" id="descriptionArea'+domainIdent+'" placeholder="Enter text ...">'+text+'</textarea></div>',
             width : width,
             height : height,
             callBack : function() {
                 $("#descriptionArea"+domainIdent).wysihtml5({});

                 $("#saveDescription"+idDescription).click(function(e) {
                     // remove the host url for images
                        text = $("#descriptionArea"+domainIdent).val().split(window.location.protocol + "//" + window.location.host+'/api/attachedfile').join('/api/attachedfile');
                         new DescriptionModel({id:idDescription,domainIdent: domainIdent, domainClassName: domainClassName}).save({
                             domainIdent: domainIdent,
                             domainClassName: domainClassName,
                             data :  text
                         }, {success: function (termModel, response) {
                             callback();
                          }, error: function (model, response) {
                              var json = $.parseJSON(response.responseText);
                              window.app.view.message("Correct term", "error:" + json.errors, "");
                          }});

                 });

             }
         });
//
//var modal = new CustomModal({
//             idModal : "descriptionModal"+domainIdent,
//             button : container.find("a.description"),
//             header :"Description",
//             body :'<div id="description'+domainIdent+'"> ' +
//                     '<form>' +
//                       <div id="toolbar"> ' +
//                         <a data-wysihtml5-command="bold" title="CTRL+B">bold</a> |  ' +
//                         <a data-wysihtml5-command="italic" title="CTRL+I">italic</a> | ' +
//                         <a data-wysihtml5-command="createLink">insert link</a> | ' +
//                         <a data-wysihtml5-command="insertImage">insert image</a> |  ' +
//                         <a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h1">h1</a> |  ' +
//                         <a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h2">h2</a> | ' +
//                         <a data-wysihtml5-command="insertUnorderedList">insertUnorderedList</a> |   ' +
//                         <a data-wysihtml5-command="insertOrderedList">insertOrderedList</a> |  ' +
//                         <a data-wysihtml5-command="foreColor" data-wysihtml5-command-value="red">red</a> |  ' +
//                         <a data-wysihtml5-command="foreColor" data-wysihtml5-command-value="green">green</a> | ' +
//                         <a data-wysihtml5-command="foreColor" data-wysihtml5-command-value="blue">blue</a> |' +
//                         <a data-wysihtml5-command="undo">undo</a> | ' +
//                         <a data-wysihtml5-command="redo">redo</a> | ' +
//                         <a data-wysihtml5-command="insertSpeech">speech</a> ' +
//                         <a data-wysihtml5-action="change_view">switch to html view</a> ' +
//
//                         <div data-wysihtml5-dialog="createLink" style="display: none;"> ' +
//                           <label>
//                             Link:
//                             <input data-wysihtml5-dialog-field="href" value="http://">
//                           </label>
//                           <a data-wysihtml5-dialog-action="save">OK</a>&nbsp;<a data-wysihtml5-dialog-action="cancel">Cancel</a>
//                         </div>
//
//                         <div data-wysihtml5-dialog="insertImage" style="display: none;">
//                           <label>
//                             Image:
//                             <input data-wysihtml5-dialog-field="src" value="http://">
//                           </label>
//                           <label>
//                             Align:
//                             <select data-wysihtml5-dialog-field="className">
//                               <option value="">default</option>
//                               <option value="wysiwyg-float-left">left</option>
//                               <option value="wysiwyg-float-right">right</option>
//                             </select>
//                           </label>
//                           <a data-wysihtml5-dialog-action="save">OK</a>&nbsp;<a data-wysihtml5-dialog-action="cancel">Cancel</a>
//                         </div>
//
//                       </div>
//                         <textarea id="textarea" placeholder="Enter text ...">
//
//
//
//                         </textarea>
//                       <br><input type="reset" value="Reset form!">
//                     </form>' +
//                     '</div>',
//             width : width,
//             height : height,
//             callBack : function() {
//                 $("#descriptionArea"+domainIdent).wysihtml5({});
//
//                 $("#saveDescription"+idDescription).click(function(e) {
//
//                         new DescriptionModel({id:idDescription,domainIdent: domainIdent, domainClassName: domainClassName}).save({
//                             domainIdent: domainIdent,
//                             domainClassName: domainClassName,
//                             data :  $("#descriptionArea"+domainIdent).val()
//                         }, {success: function (termModel, response) {
//                             callback();
//                          }, error: function (model, response) {
//                              var json = $.parseJSON(response.responseText);
//                              window.app.view.message("Correct term", "error:" + json.errors, "");
//                          }});
//
//                 });
//
//             }
//         });
         modal.addButtons("saveDescription"+idDescription,"Save",true,true);
         modal.addButtons("closeDescription"+idDescription,"Close",false,true);

    },
    initDescriptionView : function(domainIdent, domainClassName, container, maxPreviewCharNumber, callbackGet,callbackUpdate) {
         var self = this;
        new DescriptionModel({domainIdent: domainIdent, domainClassName: domainClassName}).fetch(
                {success: function (description, response) {
                    container.empty();
                    var text = description.get('data');
                    var textButton = "Edit";
//                    console.log("BEFORE:"+text);
//                    text = text.replace('\\"','"');
//                    text = text.replace('\\\\"','"');
//                    text = text.replace('\\"','"');
                    text = text.split('\\"').join('"');
//                    text = text.split('"/api').join('/api');
//                    text = text.split('download"').join('download');
//                    console.log("AFTER:"+text);
                    if(text.replace(/<[^>]*>/g, "").length>maxPreviewCharNumber) {
                        text = text.substr(0,maxPreviewCharNumber)+"...";
                        textButton = "See full text and edit"
                    }
                    container.append(text);
                    container.append(' <a href="#descriptionModal'+domainIdent+'" role="button" class="description" data-toggle="modal">'+textButton+'</a>');
                    callbackGet();

                    self.initDescriptionModal(container,description.id,domainIdent,domainClassName,description.get('data'),callbackUpdate);
                }, error: function (model, response) {
                    container.empty();
                    container.append(' <a href="#descriptionModal'+domainIdent+'" role="button" class="description" data-toggle="modal">Add description</a>');
                    self.initDescriptionModal(container,null,domainIdent,domainClassName,"",callbackUpdate);

                }});

    }
}



var ImportAnnotationModal = {

    initImportAnnotationModal : function(container,idImage,callback) {
        var width = Math.round($(window).width()*0.75);
        var height =  Math.round($(window).height()*0.75);


         var modal = new CustomModal({

             idModal : "importAnnotationModal"+idImage,
             button : container.find("a.importannotation"),
             header :"Import Annotation Layer",
             body :'<div id="importLayer'+idImage+'">Import Annotation allow you to get annotations (terms, descriptions, properties) from an image from another project. ' +
                     '<br/>The image must be the same image, in an other project. You can only import annotation from layer (user) with at least 1 annotation and layer that are in the current project.<br/><br/>  <div id="layersSelection'+idImage+'"><div class="alert alert-info"><i class="icon-refresh"/> Loading...</div></div></div>',
             width : width,
             height : height,
             callBack : function() {

                 $.get("/api/imageinstance/"+idImage+"/sameimagedata", function(data) {
                     $("#layersSelection"+idImage).empty();
                     if(data.collection.length==0) {
                         $("#layersSelection"+idImage).append("This image has no other layers in other projects.");
                     } else {
                         $("#layersSelection"+idImage).append('<input type="checkbox" id="giveMeAnnotations"> Copy all annotations on my layer (if not checked, annotation will stay on the same layers) </input><br/><br/><br/> ');
                         _.each (data.collection, function (item){
                             var layer = item.image + "_" + item.user
                             var templ = '<input type="checkbox" class="layerSelection" id="'+layer+'"> Import annotation from project ' + item.projectName + ' -> ' + item.lastname + " " + item.firstname + ' (' + item.username + ') <br/>';
                              $("#layersSelection"+idImage).append(templ);
                         });
                     }
                }).fail(function(json) {
                     window.app.view.message("Import data", json.responseJSON.errors, "error",5000);
                    $("#closeImportLayer"+idImage).click();
                });

                 $("#importLayersButton"+idImage).click(function(e) {

                     $("#closeImportLayer"+idImage).hide();
                     $("#importLayersButton"+idImage).hide();
                     var layers = []
                     _.each($("#importLayer"+idImage).find("input.layerSelection"), function(item) {
                        if($(item).is(':checked')) {
                            layers.push(item.id)
                        }
                     });
                     var giveMe = $("#giveMeAnnotations").is(':checked');
                     $("#layersSelection"+idImage).empty();
                     new TaskModel({project: window.app.status.currentProject}).save({}, {
                             success: function (task, response) {
                                 console.log(response.task);
                                 $("#layersSelection"+idImage).append('<div id="task-' + response.task.id + '"></div>');
                                 var timer = window.app.view.printTaskEvolution(response.task,  $("#layersSelection"+idImage).find("#task-" + response.task.id), 2000);


                                 $.post("/api/imageinstance/"+idImage+"/copyimagedata?task="+response.task.id+"&layers="+layers.join(",") + "&giveMe="+giveMe, function(data) {
                                     clearInterval(timer);
                                     $("#closeImportLayer"+idImage).show();
                                     $("#closeImportLayer"+idImage).click();
                                }).fail(function(json) {
                                      clearInterval(timer);
                                     window.app.view.message("Import data", json.errors, "error");
                                 });
                             },
                             error: function (model, response) {
                                 var json = $.parseJSON(response.responseText);
                                 window.app.view.message("Task", json.errors, "error");
                             }
                         }
                     );
                 });

             }
         });
         modal.addButtons("importLayersButton"+idImage,"Import these layers",true,false);
         modal.addButtons("closeImportLayer"+idImage,"Close",false,true);

    }
}


