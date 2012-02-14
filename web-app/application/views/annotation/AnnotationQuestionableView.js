var AnnotationQuestionableView = Backbone.View.extend({
    tagName : "div",
    terms : null,
    term: null,
    suggestTerm : null,
    initialize: function(options) {
        this.container = options.container;
        this.page = options.page;
        this.annotations = null; //array of annotations that are printed
        this.terms = options.terms;
        this.term = options.term;
        this.suggestTerm = options.suggestTerm;
        window.app.status.currentTermsCollection = options.terms;
        if (this.page == undefined) this.page = 0;
    },
    render: function() {

        var self = this;
        console.log("AnnotationQuestionableView: main elem "+$(self.el).length);
        $("#questionableThumb").replaceWith("");
        $(self.el).append("<div id=\"questionableThumb\"><div>");

                $(self.el).dialog({
                    title : self.createTitle(),
                    width: 900,
                    height: 500,
                    autoOpen : true,
                    modal:true,
                    buttons : {
                        "Close" : function() {
                            $(self.el).dialog("close");

                        }
                    }
                });
                self.createThumbView(self.page);

        return this;

    },
    createTitle : function() {
        var self = this;
        var termCorrect = self.terms.get(self.term).get('name');
        var termSuggest = self.terms.get(self.suggestTerm).get('name');
        return "Annotation with term " + termCorrect + " and algo suggest " + termSuggest;
    },
    createThumbView : function(page) {
        this.appendThumbs(page);
    },
    appendThumbs : function(page) {
        var self = this;
        var cpt = 0;
        var nb_thumb_by_page = 2500;
        var inf = Math.abs(page) * nb_thumb_by_page;
        var sup = (Math.abs(page) + 1) * nb_thumb_by_page;

        self.annotations = new Array();

        self.model.each(function(annotation) {

            if ((cpt >= inf) && (cpt < sup)) {
                var annotationModel = new AnnotationModel(annotation);

                  var thumb = new AnnotationThumbView({
                    model : annotationModel,
                    className : "thumb-wrap",
                    id : "annotationthumb"+annotationModel.id
                }).render();
                $("#questionableThumb").append(thumb.el);
            }
            cpt++;
            self.annotations.push(annotation.id);
        });
    },
    /**
     * Add the thumb annotation
     * @param annotation Annotation model
     */
    add : function(annotation) {

        var self = this;
        var thumb = new AnnotationThumbView({
            model : annotation,
            className : "thumb-wrap",
            id : "thumb"+annotation.get('id')
        }).render();
        $(self.el).prepend(thumb.el);

    },
    /**
     * Remove thumb annotation with id
     * @param idAnnotation  Annotation id
     */
    remove : function (idAnnotation) {
        $("#thumb"+idAnnotation).remove();
    },
    /**
     * Refresh thumb with newAnnotations collection:
     * -Add annotations thumb from newAnnotations which are not already in the thumb set
     * -Remove annotations which are not in newAnnotations but well in the thumb set
     * @param newAnnotations newAnnotations collection
     */
    refresh : function(newAnnotations) {
        var self = this;

        var arrayDeletedAnnotations = self.annotations;
        newAnnotations.each(function(annotation) {
            //if annotation is not in table, add it
            if(_.indexOf(self.annotations, annotation.id)==-1){
                self.add(annotation);
                self.annotations.push(annotation.id);
            }
            /*
             * We remove each "new" annotation from  arrayDeletedAnnotations
             * At the end of the loop, element from arrayDeletedAnnotations must be deleted because they aren't
             * in the set of new annotations
             */
            //
            arrayDeletedAnnotations = _.without(arrayDeletedAnnotations,annotation.id);

        });

        arrayDeletedAnnotations.forEach(function(removeAnnotation) {
            self.remove(removeAnnotation);
            self.annotations = _.without(self.annotations,removeAnnotation);
        });

    }


});