package be.cytomine.test.http

import be.cytomine.image.AbstractImage
import be.cytomine.test.Infos
import grails.converters.JSON
import org.codehaus.groovy.grails.web.json.JSONArray

/**
 * User: lrollus
 * Date: 6/12/11
 * GIGA-ULg
 * This class implement all method to easily get/create/update/delete/manage AbstractImage to Cytomine with HTTP request during functional test
 */
class AbstractImageAPI extends DomainAPI {

    static def list(String username, String password) {
        String URL = Infos.CYTOMINEURL + "api/abstractimage.json"
        return doGET(URL, username, password)
    }

    static def list(boolean datatable,String username, String password) {
        String URL = Infos.CYTOMINEURL + "api/abstractimage.json?datatable=${datatable}&_search=false&nd=1358249507672&rows=10&page=1&sidx=id&sord=asc"
        return doGET(URL, username, password)
    }

    static def list(boolean datatable,Long idProject, String username, String password) {
        String URL = Infos.CYTOMINEURL + "api/abstractimage.json?project=$idProject&datatables=${datatable}&_search=false&nd=1358249507672&rows=10&page=1&sidx=id&sord=asc"
        return doGET(URL, username, password)
    }

    static def show(Long id, String username, String password) {
        String URL = Infos.CYTOMINEURL + "api/abstractimage/" + id + ".json"
        return doGET(URL, username, password)
    }

    static def listByProject(Long id, String username, String password) {
        String URL = Infos.CYTOMINEURL + "api/project/$id/image.json"
        return doGET(URL, username, password)
    }

    static def getInfo(Long id, String type,String username, String password) {
        String URL = Infos.CYTOMINEURL + "api/abstractimage/" + id + "/${type}.json"
        return doGET(URL, username, password)
    }

    static def getCrop(Long id, String type,String username, String password) {
        String URL = Infos.CYTOMINEURL + "api/$type/$id/crop.json"
        return doGET(URL, username, password)
    }

    static def create(String jsonAbstractImage, String username, String password) {
        String URL = Infos.CYTOMINEURL + "api/abstractimage.json"
        def result = doPOST(URL, jsonAbstractImage,username, password)
        if(JSON.parse(jsonAbstractImage) instanceof JSONArray) return result
        result.data = AbstractImage.read(JSON.parse(result.data)?.abstractimage?.id)
        return result
    }

    static def update(def id, def jsonAbstractImage, String username, String password) {
        String URL = Infos.CYTOMINEURL + "api/abstractimage/" + id + ".json"
        return doPUT(URL,jsonAbstractImage,username,password)
    }

    static def delete(def id, String username, String password) {
        String URL = Infos.CYTOMINEURL + "api/abstractimage/" + id + ".json"
        return doDELETE(URL,username,password)
    }

}
