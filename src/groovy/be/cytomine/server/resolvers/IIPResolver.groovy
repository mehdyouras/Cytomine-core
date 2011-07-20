package be.cytomine.server.resolvers

import grails.converters.JSON

/**
 * Cytomine @ GIGA-ULG
 * User: stevben
 * Date: 10/05/11
 * Time: 11:26
 */
class IIPResolver extends Resolver{

    public LinkedList<String> args

    public IIPResolver() {
        super()

        this.args = new LinkedList<String>()
    }

    public String toURL(String base_url) {
        String url = base_url  + ARGS_PREFIX;
        int cpt = 0;
        for (String arg : args) {
            url += arg;
            cpt++;
            if (cpt != args.size()) url += ARGS_DELIMITER;
        }
        url = url.replace(" ", "%20")
        return url;
    }

    public String getThumbUrl(String baseUrl, String imagePath, int width) {
        args.clear()
        args.add("FIF" + ARGS_EQUAL + imagePath)
        args.add("SDS" + ARGS_EQUAL +  "0,90")
        args.add("CNT" + ARGS_EQUAL + "1.0")
        args.add("WID" + ARGS_EQUAL + width)
        args.add("SQL" + ARGS_EQUAL + "99")
        args.add("CVT" + ARGS_EQUAL + "jpeg")
        return toURL(baseUrl)

    }

    public String getPreviewUrl(String baseUrl, String imagePath) {
        args.clear()
        args.add("FIF" + ARGS_EQUAL + imagePath)
        args.add("SDS" + ARGS_EQUAL + "0,90")
        args.add("CNT" + ARGS_EQUAL + "1.0")
        args.add("CVT" + ARGS_EQUAL + "jpeg")
        args.add("QLT" + ARGS_EQUAL + "99")
        return toURL(baseUrl)
    }

    public String getPropertiesURL(String baseUrl, String imagePath) {
        args.clear()
        args.add("FIF" + ARGS_EQUAL +  imagePath)
        args.add("obj" + ARGS_EQUAL +  "Image-Properties")
        return toURL(baseUrl)
    }

    public String getMetaDataURL(String baseUrl, String imagePath) {
        //http://localhost/fcgi-bin/iipsrv.fcgi?FIF=/home/maree/CYTOMINE/WholeSlides/Aperio/o.tif&obj=IIP,1.0&obj=Max-size&obj=Tile-size&obj=Resolution-number
        args.clear()
        args.add("FIF" + ARGS_EQUAL +  imagePath)
        args.add("obj" + ARGS_EQUAL +  "IIP,1.0")
        args.add("obj" + ARGS_EQUAL +  "Max-size")
        args.add("obj" + ARGS_EQUAL +  "Tile-size")
        args.add("obj" + ARGS_EQUAL +  "Resolution-number")
        return toURL(baseUrl)
    }

    public String getCropURL(String baseUrl, String imagePath, int topLeftX, int topLeftY, int width, int height, int zoom, int baseImageWidth, int baseImageHeight) {
        /*
        #Y is the down inset value (positive) from 0 on the y axis at the max image resolution.
        #X is the right inset value (positive) from 0 on the x axis at the max image resolution.
        #H is the height of the image provided as response.
        #W is the width of the image provided as response.
        X : 1/(34207/15000) = 0.4399859205
        Y : 1/(34092/15100) = 0.4414301166
        W : 1/(34092/400) = 0.01173295788
        H : 1/(34207/600) = 0.01754026954*/
        def x = 1/(baseImageWidth / topLeftX)
        def y = 1/(baseImageHeight / (baseImageHeight - topLeftY))
        def w = 1/(baseImageWidth / width)
        def h = 1/(baseImageHeight / height)
        args.clear()
        args.add("FIF" + ARGS_EQUAL +  imagePath)
        args.add("RGN" + ARGS_EQUAL +  x + "," + y + "," + w + "," + h)
        args.add("CVT" + ARGS_EQUAL + "jpeg")
        return toURL(baseUrl)
    }

    public String getCropURL(String baseUrl, String imagePath, int topLeftX, int topLeftY, int width, int height, int baseImageWidth, int baseImageHeight) {
        def maxZoom = getZoomLevels(baseUrl, imagePath, baseImageWidth, baseImageHeight).max
        def widthTarget = 500
        def tmpWidth = width
        while (tmpWidth > widthTarget) {
            maxZoom--
            tmpWidth = tmpWidth / 2
        }
        getCropURL(baseUrl, imagePath, topLeftX, topLeftY, width, height, maxZoom, baseImageWidth, baseImageHeight)
    }

    /*def getWidthHeight(baseUrl, imagePath) {
        def url = new URL(getMetaDataURL(baseUrl, imagePath))
        def dimensions = null
        url.eachLine { line ->
            def args = line.split(":")
            if (args[0].equals("Max-size")) {
                def sizes = args[1].split(" ")
                dimensions = [width : Integer.parseInt(sizes[0]), height : Integer.parseInt(sizes[1])]
            }
        }
        return dimensions
    }*/

    def getZoomLevels (baseUrl, imagePath, width, height) {
        def tmpWidth = width
        def tmpHeight = height
        def nbZoom = 0
        while (tmpWidth >= 256 || tmpHeight >= 256) {
            nbZoom++
            tmpWidth = tmpWidth / 2
            tmpHeight = tmpHeight / 2
        }
        return [min : 0, max : nbZoom, middle : (nbZoom / 2), overviewWidth : Math.round(tmpWidth), overviewHeight : Math.round(tmpHeight), width : dimensions.width, height : dimensions.height]
    }
}
