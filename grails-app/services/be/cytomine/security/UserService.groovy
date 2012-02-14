package be.cytomine.security

import be.cytomine.Exception.ForbiddenException
import be.cytomine.Exception.ObjectNotFoundException
import be.cytomine.ModelService
import be.cytomine.command.AddCommand
import be.cytomine.command.DeleteCommand
import be.cytomine.command.EditCommand
import be.cytomine.project.Project
import be.cytomine.project.ProjectGroup
import org.codehaus.groovy.grails.web.json.JSONObject
import static org.springframework.security.acls.domain.BasePermission.ADMINISTRATION
import static org.springframework.security.acls.domain.BasePermission.DELETE
import static org.springframework.security.acls.domain.BasePermission.READ
import static org.springframework.security.acls.domain.BasePermission.WRITE
import org.springframework.security.access.prepost.PreAuthorize



class UserService extends ModelService {

    static transactional = true

    def springSecurityService
    def transactionService
    def cytomineService
    def commandService
    def domainService
    def userGroupService
    def projectService



    def get(def id) {
        User.get(id)
    }

    def read(def id) {
        User.read(id)
    }

    def readCurrentUser() {
        cytomineService.getCurrentUser()
    }

    def list() {
        User.list(sort: "username", order: "asc")
    }

    def list(Project project) {
        project.users()
    }

    def add(def json) {
        User currentUser = cytomineService.getCurrentUser()
        return executeCommand(new AddCommand(user: currentUser), json)
    }

    def update(def domain,def json) {
        User currentUser = cytomineService.getCurrentUser()
        return executeCommand(new EditCommand(user: currentUser), json)
    }

    def delete(def domain,def json) {
        User currentUser = cytomineService.getCurrentUser()

        if (json.id == springSecurityService.principal.id) throw new ForbiddenException("The user can't delete herself")
        return executeCommand(new DeleteCommand(user: currentUser), json)
    }

    /*def clearUser = {
   log.info "ClearUser"
   User currentUser = getCurrentUser(springSecurityService.principal.id)
   log.info "User:" + currentUser.username + " params.idProject=" + params.id
   ///ouh le vilain code!
   Project project = Project.get(params.id)
   log.info "project= " + project
   if (project) {
     Group group = Group.findByName(project.name)
     log.info "group= " + group
     if (group) {
       ProjectGroup.unlink(project, group)
       def users = group.users();
       log.info users.size()
       users.each { user ->
         log.info "remove " + user.username + " from " + group.name
         UserGroup.unlink(user, group)
       }
       group.delete(flush:true)

       log.info "Group and project are unlink"
     }
     else {
       log.error "Cannot find group " + project.name
     }
   }
   response.status = 201
   def ret = [data: [message: "ok"], status: 201]
   response(ret)

 }   */

//    def deleteUserFromProject(User user, Project project) {
//        synchronized (this.getClass()) {
//
//            if (project) {
//                Group group = Group.findByName(project.name)
//                log.info "group= " + group
//                if (!group) {
//                    group = new Group(name: project.name)
//                    group.save()
//                    ProjectGroup.link(project, group)
//                }
//
//                userGroupService.unlink(user, group)
//            }
//        }
//    }
//
//    def addUserFromProject(User user, Project project) {
//        synchronized (this.getClass()) {
//            if (project) {
//                Group group = Group.findByName(project.name)
//                log.info "group= " + group
//                if (!group) {
//                    group = new Group(name: project.name)
//                    group.save()
//                    ProjectGroup.link(project, group)
//                }
//                userGroupService.link(user, group);
//            }
//        }
//        def ret = [data: [message: "OK"], status: 201]
//        ret
//    }

    //TODO: when project private/public, a user must have permission to add himself in a public project
    @PreAuthorize("hasPermission(#project,admin) or #user.id == principal.id or hasRole('ROLE_ADMIN')")
    def addUserFromProject(SecUser user, Project project, boolean admin) {
            if (project) {
                log.debug "addUserFromProject project=" + project + " username=" + user.username + " ADMIN=" + admin
                if(admin) projectService.addPermission(project,user.username,ADMINISTRATION)
                else {
                    projectService.addPermission(project,user.username,READ)
                    //projectService.addPermission(project,user.username,WRITE)
                }
            }
        [data: [message: "OK"], status: 201]
    }

    @PreAuthorize("hasPermission(#project,admin) or #user.id == principal.id or hasRole('ROLE_ADMIN')")
    def deleteUserFromProject(SecUser user, Project project, boolean admin) {
            if (project) {
                log.debug "deleteUserFromProject project=" + project?.id + " username=" + user?.username + " ADMIN=" + admin
                if(admin) projectService.deletePermission(project,user,ADMINISTRATION)
                else {
                    projectService.deletePermission(project,user,READ)
                    //projectService.deletePermission(project,user.username,WRITE)
                }
            }
       [data: [message: "OK"], status: 201]
    }



    def list(def currentPage, def maxRows, def sortIndex, def sortOrder, def firstName, def lastName, def email) {
        def rowOffset = currentPage == 1 ? 0 : (currentPage - 1) * maxRows
        def users = User.createCriteria().list(max: maxRows, offset: rowOffset) {
            if (firstName)
                ilike('firstname', "%${firstName}%")

            if (lastName)
                ilike('lastname', "%${lastName}%")

            if (email)
                ilike('email', "%${email}%")

            order(sortIndex, sortOrder).ignoreCase()
        }
        return users
    }

    /**
     * Restore domain which was previously deleted
     * @param json domain info
     * @param printMessage print message or not
     * @return response
     */
    def create(JSONObject json, boolean printMessage) {
        create(User.createFromDataWithId(json), printMessage)
    }

    def create(User domain, boolean printMessage) {
        //Save new object
        domainService.saveDomain(domain)
        //Build response message
        return responseService.createResponseMessage(domain, [domain.id, domain.username], printMessage, "Add", domain.getCallBack())
    }
    /**
     * Destroy domain which was previously added
     * @param json domain info
     * @param printMessage print message or not
     * @return response
     */
    def destroy(JSONObject json, boolean printMessage) {
        //Get object to delete
        destroy(User.get(json.id), printMessage)
    }

    def destroy(User domain, boolean printMessage) {
        //Build response message
        def response = responseService.createResponseMessage(domain, [domain.id, domain.username], printMessage, "Delete", domain.getCallBack())
        //Delete object
        domainService.deleteDomain(domain)
        return response
    }

    /**
     * Edit domain which was previously edited
     * @param json domain info
     * @param printMessage print message or not
     * @return response
     */
    def edit(JSONObject json, boolean printMessage) {
        //Rebuilt previous state of object that was previoulsy edited
        edit(fillDomainWithData(new User(), json), printMessage)
    }

    def edit(User domain, boolean printMessage) {
        //Build response message
        def response = responseService.createResponseMessage(domain, [domain.id, domain.username], printMessage, "Edit", domain.getCallBack())
        //Save update
        domainService.saveDomain(domain)
        return response
    }

    /**
     * Create domain from JSON object
     * @param json JSON with new domain info
     * @return new domain
     */
    User createFromJSON(def json) {
        return User.createFromData(json)
    }

    /**
     * Retrieve domain thanks to a JSON object
     * @param json JSON with new domain info
     * @return domain retrieve thanks to json
     */
    def retrieve(JSONObject json) {
        User user = User.get(json.id)
        if (!user) throw new ObjectNotFoundException("User " + json.id + " not found")
        return user
    }
}