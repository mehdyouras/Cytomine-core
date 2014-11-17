var ExplorerTabs = Backbone.View.extend({
    tagName: "div",
    triggerRoute: true,
    /**
     * ExplorerTabs constructor
     * @param options
     */
    initialize: function (options) {
        this.tabs = []; //that we are browsing
        this.container = options.container;
        this.dashboard = null;
    },
    /**
     * Grab the layout and call ask for render
     */
    render: function () {
        var self = this;
        require(["text!application/templates/explorer/Tabs.tpl.html"], function (tpl) {
            self.doLayout(tpl);
        });
        return this;
    },
    /**
     * Render the html into the DOM element associated to the view
     * @param tpl
     */
    doLayout: function (tpl) {
        $(this.el).html(_.template(tpl, {}));
        return this;
    },
    showLastTab : function(avoid) {
        console.log("avoid="+avoid);
        var i=(this.tabs.length-1);
        while(i>=0) {
            console.log("i="+i);
            console.log(this.tabs[i].idImage);
            if(this.tabs[i].idImage!=avoid) {
                var id = this.tabs[i].view.divPrefixId + "-" + this.tabs[i].idImage;  //$("#tabs-image-16829").tab('show');
                console.log("show:"+id);
                console.log($("#"+id).length);


                var millisecondsToWait = 250;
               setTimeout(function() {
                   // Whatever you want to do after the wait
                   console.log("#"+id);
                   $("#"+id).tab('show');
               }, millisecondsToWait);

                break;
            }
            i--;
        }
    },
    /**
     *  Add a Tab containing a BrowseImageView instance
     *  @idImage : the id of the Image we want to display
     *  @options : some init options we want to pass the the BrowseImageView Instance
     */
    addBrowseImageView: function (idImage, options,merge) {
        var self = this;
        var tab = this.getImageView(idImage);
        if (tab != null) {
            //open tab if already exist
            tab.view.show(options);
            self.showTab(idImage, "image");
            return;
        }
        tab = this.getImageView("review-" + idImage);
        if (tab != null) {
            //close review tab for this image if already exist
            $("#closeTabtabs-review-" + idImage).click()
        }

        var tabs = $("#explorer-tab-content");
        console.log("BrowseImageView");
        var view = new BrowseImageView({
            initCallback: function () {
                view.show(options)
            },
            el: tabs,
            merge : merge
        });
        self.tabs.push({idImage: idImage, view: view});

        var openTab = function(model) {
            view.model = model.image;
            view.render();
            if(model.position) {
                view.position = {x:model.x,y:model.y,zoom:model.zoom}
            }

            $("#closeTabtabs-image-" + idImage).on("click", function (e) {
                var idImage = $(this).attr("data-image");
                self.removeTab(idImage, "image");
                self.showLastTab(idImage);
            });
            self.showTab(idImage, "image");
        }

        var imageNew = window.app.popNewImage();
        if(imageNew && imageNew.image && imageNew.image.id==idImage) {
            openTab(imageNew)
        } else {
            new ImageInstanceModel({id: idImage}).fetch({
                success: function (model, response) {
                    openTab({image:model, position: false});
                }
            });
        }
    },
    addReviewImageView: function (idImage, options,merge) {
        var self = this;
        var tab = this.getImageView("review-" + idImage);
        if (tab != null) {
            //open tab if already exist
            tab.view.show(options);
            self.showTab(idImage, "review");
            return;
        }
        tab = this.getImageView(idImage);
        if (tab != null) {
            //close image tab for this image if already exist
            $("#closeTabtabs-image-" + idImage).click()
        }

        var tabs = $("#explorer-tab-content");
        var view = new BrowseImageView({
            initCallback: function () {
                view.show(options)
            },
            el: tabs,
            review: true,
            merge : merge
        });
        self.tabs.push({idImage: "review-" + idImage, view: view});
        var openTab = function(model) {
            view.model = model.image;
            console.log(view.model);
            view.render();
            $("#closeTabtabs-review-" + idImage).on("click", function (e) {
                var idImage = $(this).attr("data-image");
                self.removeTab(idImage, "review");
                self.showLastTab(idImage);
            });
            self.showTab(idImage, "review");

            if (model.image.get("inReview") == false && model.image.get("reviewed") == false) {

                self.removeTab(idImage, "review");
                window.app.view.message("Review image", "You must first start reviewing picture before review it!", "warning");
            }
        }

        var imageNew = window.app.popNewImage();
        if(imageNew && imageNew.image && imageNew.image.id==idImage) {
            openTab(imageNew);
        } else {
            new ImageInstanceModel({id: idImage}).fetch({
                success: function (model, response) {
                    console.log("ImageInstanceModel="+idImage);
                    openTab({image:model, position: false});
                }
            });
        }
    },

    /**
     * Return the reference to a BrowseImageView instance
     * contained in a tab
     * @param idImage the ID of an Image contained in a BrowseImageView
     */
    getImageView: function (idImage) {
        var object = _.detect(this.tabs, function (object) {
            return object.idImage == idImage;
        });
        return object != null ? object : null;
    },
    /**
     * Remove a Tab
     * @param index the identifier of the Tab
     */
    removeTab: function (idImage, prefix) {

        var browseImageView = null

        if (prefix != "review") {
            browseImageView = this.getImageView(idImage);
        }
        else {
            browseImageView = this.getImageView("review-" + idImage);
        }

        browseImageView.view.stopBroadcastingInterval();
        browseImageView.view.stopWatchOnlineUsersInterval();
        var indexOf = this.tabs.indexOf(browseImageView);

        this.tabs.splice(indexOf, 1);
        var tabs = $('#explorer-tab');
        //Remove Tab
        $('#tabs-' + prefix + '-' + idImage).parent().remove();
        //Remove dropdown
        $('#tabs-' + prefix + '-' + idImage + "-dropdown").parent().remove();
        //Remove content
        $('#tabs-' + prefix + '-' + window.app.status.currentProject + '-' + idImage + '-').remove();
    },
    /**
     * Show a tab
     * @param idImage the identifier of the Tab
     */
    showTab: function (idImage, prefix) {
        window.app.status.currentImage = {};
        window.app.status.currentImage.idImage = idImage;
        window.app.status.currentImage.prefix = prefix;
        var tabs = $('#explorer-tab');
        window.app.controllers.browse.tabs.triggerRoute = false;
        $('#tabs-' + prefix + '-' + idImage).click();
        window.app.controllers.browse.tabs.triggerRoute = true;
    },
    /**
     * Go to a specific image and close another one (usefull for next/previous or multidim go to)
     */
    goToImage : function(idImageToOpen,idProject, idImageToClose, mode, imageToOpen,x,y,zoom,merge) {
        var self = this;
        if(imageToOpen && x) {
            window.app.setNewImageWithPosition(imageToOpen,x,y,zoom);
        } else if(imageToOpen) {
            window.app.setNewImage(imageToOpen);
       }
        window.app.controllers.browse.tabs.removeTab(idImageToClose,mode) //TODO support REVIEW TOO!!!!

        if(merge) {
            mode = mode +"mergechannel"
        }
        console.log("goTo"+"#tabs-" + mode + "-"+idProject+"-"+idImageToOpen+"-") ;
        var urldest = "#tabs-" + mode + "-"+idProject+"-"+idImageToOpen+"-"

        if(window.location.hash==urldest) {
            window.location.reload();
        } else {
            window.location = urldest
        }
    },

    /**
     * Return the number of opened tabs
     */
    size: function () {
        return _.size(this.tabs);
    },
    /**
     * Close all the Tabs
     */
    closeAll: function () {
        var tabs = $(this.el).children('.tabs');
        this.tabs = [];
        $(this.el).hide();
        $(this.el).parent().find('.noProject').show();
    },
    /**
     * Add a ProjectDashBoardView instance in the first Tab
     * @param dashboard the ProjectDashBoardView instance
     */
    addDashboard: function (dashboard) {
        var self = this;
        this.dashboard = dashboard;

        // If the project name is too long, we truncate it.
        var projectName = window.app.status.currentProjectModel.attributes.name;
        if(projectName.length > 30) {
            projectName = projectName.substring(0, 13) + "..." + projectName.substring(projectName.length-14, projectName.length);
        }
        var tabs = $('#explorer-tab');
        tabs.append(_.template("<li class='custom-ui-project-dashboard-tab' id='project-dashboard-tab'><a id='dashboardLink-<%= idProject %>' href='#tabs-dashboard-<%= idProject %>' data-toggle='tab'><i class='icon-road' /> <%= name %></a></li>", { idProject: window.app.status.currentProject, name: projectName}));
        tabs.append(_.template("<li class='custom-ui-project-images-tab' id='project-images-tab'><a href='#tabs-images-<%= idProject %>' data-toggle='tab'><i class='icon-picture' /> Images</a></li>", { idProject: window.app.status.currentProject}));
        tabs.append(_.template("<li class='custom-ui-project-annotations-tab' id='project-annotations-tab' style='display:none;'><a href='#tabs-annotations-<%= idProject %>' data-toggle='tab'><i class='icon-pencil' /> Annotations</a></li>", { idProject: window.app.status.currentProject}));
	    tabs.append(_.template("<li class='custom-ui-project-properties-tab' id='project-properties-tab' style='display:none;'><a class='annotationTabLink' href='#tabs-properties-<%= idProject %>' data-toggle='tab'><i class='icon-list' /> Properties</a></li>", { idProject: window.app.status.currentProject}));
        tabs.append(_.template("<li class='custom-ui-project-jobs-tab' id='project-jobs-tab' style='display:none;'><a href='#tabs-algos-<%= idProject %>' data-toggle='tab'><i class='icon-tasks' /> Jobs</a></li>", { idProject: window.app.status.currentProject}));
        tabs.append(_.template("<li class='custom-ui-project-configuration-tab' id='project-configuration-tab' style='display:none;'><a href='#tabs-config-<%= idProject %>' data-toggle='tab'><i class='icon-wrench' /> Configuration</a></li>", { idProject: window.app.status.currentProject}));
        tabs.append(_.template("<li class='custom-ui-project-review-tab' id='project-review-tab'><a href='#tabs-reviewdash-<%= idProject %>' data-toggle='tab'><i class='icon-chevron-down' /> Review</a></li>", { idProject: window.app.status.currentProject}));

        //hide review tab
        tabs.find("a[href='#tabs-reviewdash-"+window.app.status.currentProject+"']").parent().hide();


        CustomUI.customizeUI(function() {CustomUI.hideOrShowComponents();});



        tabs.on('click','a[data-toggle="tab"]', function (e) {
            var hash = this.href.split("#")[1];
            $("#" + hash).attr('style', 'overflow:none;');
            if (self.triggerRoute) {
                window.app.controllers.browse.navigate("#" + hash, self.triggerRoute);
            }
        });

        $("#explorer > .browser").show();
        $("#explorer > .noProject").hide();

    },
    /**
     * Ask to the dashboard view to refresh
     */
    getDashboard: function () {
        return this.dashboard;
    }
});
