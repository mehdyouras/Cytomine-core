package be.cytomine.utils

import be.cytomine.api.RestController

class ArchiveController extends RestController {


    def grailsApplication
    def modelService
    def springSecurityService
    def archiveCommandService
    def simplifyGeometryService
    def scriptService


    def archive() {
        archiveCommandService.archiveOldCommand()
        responseSuccess([])
    }

    def script() {
        scriptService.statsProject()
    }
}