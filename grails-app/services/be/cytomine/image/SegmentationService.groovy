package be.cytomine.image

import com.vividsolutions.jts.geom.Coordinate
import com.vividsolutions.jts.geom.Geometry
import ij.ImagePlus
import ij.process.ImageProcessor
import ij.process.PolygonFiller

import java.awt.*
import java.awt.image.BufferedImage

/**
 * TODO: refactoring + doc + test
 */
class SegmentationService {

    static transactional = false


    BufferedImage colorizeWindow(AbstractImage image, BufferedImage window, Collection<Geometry> geometryCollection, Color color, int x, int y, double x_ratio, double y_ratio) {

        ImagePlus imagePlus = new ImagePlus("", window)
        ImageProcessor ip = imagePlus.getProcessor()
        ip.setColor(color)
        //int[] pixels = (int[]) ip.getPixels()
        geometryCollection.each { geometry ->
            Collection<Coordinate> coordinates = geometry.getCoordinates()
            int[] _x = new int[coordinates.size()]
            int[] _y = new int[coordinates.size()]
            coordinates.eachWithIndex { coordinate, i ->
                if(i%100==0) {
                    println "*** $i/${coordinates.size()} coordinates"
                }
                int xLocal = Math.min((coordinate.x - x) * x_ratio, window.getWidth());
                xLocal = Math.max(0, xLocal)
                int yLocal = Math.min((image.getHeight() - coordinate.y - y) * x_ratio, window.getHeight());
                yLocal = Math.max(0, yLocal)
                _x[i] = xLocal
                _y[i] = yLocal
            }
            PolygonFiller polygonFiller = new PolygonFiller()
            polygonFiller.setPolygon(_x, _y, coordinates.size())
            polygonFiller.fill(ip, new Rectangle(window.getWidth(), window.getHeight()))
        }
        //ip.setPixels(pixels)
        ip.getBufferedImage()
    }
}