/**
 * Created by IntelliJ IDEA.
 * User: lrollus
 * Date: 7/04/11
 * Time: 15:01
 * To change this template use File | Settings | File Templates.
 */
var OntologyModel = Backbone.Model.extend({

	url : function() {
		var base = 'api/ontology';
		var format = '.json';
        if (this.isNew()) return base + format;
		return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id + format;
	}
});


// define our collection
var OntologyCollection = Backbone.Collection.extend({
    model: OntologyModel,

    url: 'api/ontology.json',
    initialize: function () {
        // something
    },

	parse: function(response) {
		console.log("response : " + response);
	    return response.ontology;
	}
});