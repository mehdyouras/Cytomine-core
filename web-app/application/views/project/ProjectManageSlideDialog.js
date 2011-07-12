/**
 * Created by IntelliJ IDEA.
 * User: lrollus
 * Date: 28/04/11
 * Time: 10:14
 * To change this template use File | Settings | File Templates.
 */
var ProjectManageSlideDialog = Backbone.View.extend({
    imageListing : null,
    imageThumb : null,
    projectPanel : null,
    addSlideDialog : null,
    imagesProject : null,
    divDialog : "div#projectaddimagedialog",
    /**
     * Grab the layout and call ask for render
     */
    render : function() {
        var self = this;
        require([
            "text!application/templates/project/ProjectAddImageDialog.tpl.html"
        ],
               function(tpl) {
                   self.doLayout(tpl);
               });
        return this;
    },
    initialize: function(options) {
        this.container = options.container;
        this.projectPanel = options.projectPanel;
        this.imagesProject = new ImageInstanceCollection({project:this.model.get('id')});
    },
    refresh : function() {
        if(this.imageListing!=undefined) this.imageListing.refresh();
        if(this.imageThumb!=undefined) this.imageThumb.refresh();
    },
    /**
     * Render the html into the DOM element associated to the view
     * @param tpl
     */
    doLayout : function(tpl) {
        var self = this;
        console.log("Id project="+this.model.id);

        console.log(" _.template");

        $("#addimagediv").empty();


        var dialog = _.template(tpl, {id:self.model.get('id'),name:self.model.get('name')});
        $(self.el).append(dialog);

        $("button[class=goBackToProject]").click(function() {
            self.projectPanel.refresh();
            $("#projectdiv").show();
            $("#addimagediv").hide();
        });

        /*console.log("ProjectAddImageThumbDialog");
        self.imageThumb = new ProjectAddImageThumbDialog({
            model : self.model,
            projectsPanel : self,
            imagesProject : self.imagesProject,
            slides : window.app.models.slides,
            images : window.app.models.images,
            el : "#tabsProjectaddimagedialog"+self.model.id+"-1"
        }).render();
        console.log("render() 1 ok");*/

        console.log("ProjectAddImageListingDialog");
        self.imageListing = new ProjectAddImageListingDialog({
            model : self.model,
            projectsPanel : self,
            imagesProject : self.imagesProject,
            el : "#tabsProjectaddimagedialog"+self.model.id+"-2"
        }).render();
        console.log("render() 2 ok");

        $("button[class=goBackToProject]").button({
            icons : {primary: "ui-icon-circle-triangle-w"}
        });

        $("input[class=showImageTable]").click(function() {
            self.imageListing.refresh();
            $("#tabsProjectaddimagedialog"+self.model.id+"-2").show();
            $("#tabsProjectaddimagedialog"+self.model.id+"-1").hide();
        });

        $("input[class=showImageTable]").click();//START WITH TABLE

        $("input[class=showImageTable]").button({
            icons : {primary: "ui-icon-document"}
        });



        $("input[class=showImageThumbs]").click(function() {
            self.imageThumb.refresh();
            $("#tabsProjectaddimagedialog"+self.model.id+"-1").show();
            $("#tabsProjectaddimagedialog"+self.model.id+"-2").hide();
        });

        $("input[class=showImageThumbs]").button({
            icons : {primary: "ui-icon-image"}
        });



        $("#addimagediv").append($(self.divDialog+self.model.get('id')));

        $(".ui-panel-header").css("display","block");

        self.open();


        return this;

    },

    /**
     * Open and ask to render image thumbs
     */
    open: function() {
        //this.addSlideDialog.dialog("open") ;
    }



});