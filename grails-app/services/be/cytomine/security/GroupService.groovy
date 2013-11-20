package be.cytomine.security

import be.cytomine.SecurityACL
import be.cytomine.command.*
import be.cytomine.image.AbstractImage
import be.cytomine.image.AbstractImageGroup
import be.cytomine.utils.ModelService
import be.cytomine.utils.Task

class GroupService extends ModelService {

    static transactional = true
    def cytomineService
    def commandService
    def abstractImageGroupService
    def userGroupService
    def transactionService

    def currentDomain() {
        Group
    }

    def list() {
        SecurityACL.checkGuest(cytomineService.currentUser)
        return Group.list(sort: "name", order: "asc")
    }

    //TODO:: security!
    def list(AbstractImage abstractImage) {
        return AbstractImageGroup.findAllByAbstractImage(abstractImage).collect{it.group}
    }

    def list(User user) {
        SecurityACL.checkGuest(cytomineService.currentUser)
        UserGroup.findByUser(user).collect{it.group}
    }

    def read(def id) {
        SecurityACL.checkGuest(cytomineService.currentUser)
        return Group.read(id)
    }

    def get(def id) {
        SecurityACL.checkGuest(cytomineService.currentUser)
        return Group.get(id)
    }

    /**
     * Add the new domain with JSON data
     * @param json New domain data
     * @return Response structure (created domain data,..)
     */
    def add(def json) {
        SecUser currentUser = cytomineService.getCurrentUser()
        SecurityACL.checkGuest(currentUser)
        return executeCommand(new AddCommand(user: currentUser),null,json)
    }

    /**
     * Update this domain with new data from json
     * @param domain Domain to update
     * @param jsonNewData New domain datas
     * @return  Response structure (new domain data, old domain data..)
     */
    def update(Group group, def jsonNewData) {
        SecUser currentUser = cytomineService.getCurrentUser()
        SecurityACL.checkIfUserIsMemberGroup(currentUser,group)
        return executeCommand(new EditCommand(user: currentUser),group, jsonNewData)
    }

    /**
     * Delete this domain
     * @param domain Domain to delete
     * @param transaction Transaction link with this command
     * @param task Task for this command
     * @param printMessage Flag if client will print or not confirm message
     * @return Response structure (code, old domain,..)
     */
    def delete(Group domain, Transaction transaction = null, Task task = null, boolean printMessage = true) {
        SecUser currentUser = cytomineService.getCurrentUser()
        SecurityACL.checkAdmin(currentUser)
        Command c = new DeleteCommand(user: currentUser,transaction:transaction)
        return executeCommand(c,domain,null)
    }

    def getStringParamsI18n(def domain) {
        return [domain.id, domain.name]
    }


    def deleteDependentAbstractImageGroup(Group group, Transaction transaction, Task task = null) {
        AbstractImageGroup.findAllByGroup(group).each {
            abstractImageGroupService.delete(it,transaction,null,false)
        }
    }

    def deleteDependentUserGroup(Group group, Transaction transaction, Task task = null) {
        UserGroup.findAllByGroup(group).each {
            userGroupService.delete(it, transaction,null,false)
        }
    }

}
