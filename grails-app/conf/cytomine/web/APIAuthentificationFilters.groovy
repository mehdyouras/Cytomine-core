package cytomine.web

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

import javax.crypto.spec.SecretKeySpec
import javax.crypto.Mac
import org.springframework.security.core.codec.Base64
import be.cytomine.security.SecUser
import javax.servlet.FilterConfig
import javax.servlet.FilterChain
import javax.servlet.ServletResponse
import javax.servlet.ServletRequest
import org.codehaus.groovy.grails.plugins.springsecurity.SpringSecurityUtils
import javax.servlet.http.HttpServletRequestWrapper
import org.springframework.web.multipart.MultipartHttpServletRequest
import org.springframework.web.multipart.support.DefaultMultipartHttpServletRequest



class APIAuthentificationFilters implements javax.servlet.Filter {

    void init(FilterConfig filterConfig) {

    }

    void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) {
        tryAPIAuthentification(request, response)
        chain.doFilter(request, response);
    }

    void destroy() {}

    /**
     * http://code.google.com/apis/storage/docs/reference/v1/developer-guidev1.html#authentication
     */
    private boolean tryAPIAuthentification(HttpServletRequest request, HttpServletResponse response) {
        String authorization = request.getHeader("authorization")
        if (request.getHeader("date") == null) {
            //println "Date Header Must be set"
            return false
        }
        if (request.getHeader("host") == null) {
            //println "Host Header Must be set"
            return false
        }
        if (authorization == null) {
            //println "Authorization Header must be set"
            return false
        }
        if (!authorization.startsWith("CYTOMINE") || !authorization.indexOf(" ") == -1 || !authorization.indexOf(":") == -1) {
            //println "Authorization Header is not valid"
            return false
        }
        try {

            String content_md5 = (request.getHeader("content-MD5") != null) ? request.getHeader("content-MD5") : ""
            String content_type = (request.getHeader("content-type") != null) ? request.getHeader("content-type") : ""
            content_type = (request.getHeader("Content-Type") != null) ? request.getHeader("Content-Type") : content_type
            String date = (request.getHeader("date") != null) ? request.getHeader("date") : ""
            String canonicalHeaders = request.getMethod() + "\n" + content_md5 + "\n" + content_type + "\n" + date + "\n"
            String canonicalExtensionHeaders = ""
            String queryString = (request.getQueryString() != null) ? "?" + request.getQueryString() : ""
            String path = request.forwardURI //original URI Request
            String canonicalResource = path + queryString
            String messageToSign = canonicalHeaders + canonicalExtensionHeaders + canonicalResource
            String signature = ""
            String method = authorization.substring(0, authorization.indexOf(" "))
            String accessKey = authorization.substring(authorization.indexOf(" ") + 1, authorization.indexOf(":"))
            String authorizationSign = authorization.substring(authorization.indexOf(":") + 1)
            SecUser user = SecUser.findByPublicKey(accessKey)
            if (!user) {
                return false
            }
            String key = user.getPrivateKey()
            SecretKeySpec signingKey = new SecretKeySpec(key.getBytes(), "HmacSHA1")
            // get an hmac_sha1 Mac instance and initialize with the signing key
            Mac mac = Mac.getInstance("HmacSHA1")
            mac.init(signingKey)
            // compute the hmac on input data bytes
            byte[] rawHmac = mac.doFinal(new String(messageToSign.getBytes(), "UTF-8").getBytes())
            // base64-encode the hmac
            byte[] signatureBytes = Base64.encode(rawHmac)
            signature = new String(signatureBytes)
            if (authorizationSign == signature) {
                SpringSecurityUtils.reauthenticate user.getUsername(), null
                return true
            } else {
                return false
            }

        } catch (Exception e) {
            e.printStackTrace()
            return false
        }
        return false
    }

    def filters = {
        all(uri:'/api/**') {
            before = {
            }
            after = {

            }
            afterView = {

            }
        }
    }

}