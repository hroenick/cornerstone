var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // TODO: make a generic data storage mechanism for elements that
    //       gets cleaned up when the element is destroyed
    var toolData = {};

    function onMouseDown(e) {
        var element = e.currentTarget;
        var data = toolData[element];
        if(e.which == data.whichMouseButton) {
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            data.startX = coords.x;
            data.startY = coords.y;
            data.endX = coords.x;
            data.endY = coords.y;
            data.lengthVisible = true;

            $(document).mousemove(function(e) {
                var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
                data.endX = coords.x;
                data.endY = coords.y;
                cornerstone.updateImage(element);
            });

            $(document).mouseup(function(e) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        }
    };

    function calculateMeanStdDev(sp, radius)
    {
        // TODO: Get a real statistics library here that supports large counts
        if(count == 0) {
            return {
                count: count,
                mean: 0.0,
                variance: 0.0,
                stdDev: 0.0
            };
        }

        var diameter = Math.round(radius * 2);
        var radiusSquared = radius * radius;

        var sum = 0;
        var sumSquared =0;
        var count = 0;
        var index =0;

        for(var y=0; y < diameter; y++) {
            var ysq = (radius - y) * (radius - y);
            for(var x=0; x < diameter; x++) {
                var xsq = (radius - x) * (radius - x);
                var distanceSquared = xsq + ysq;
                if(distanceSquared < radiusSquared) {
                    sum += sp[index];
                    sumSquared += sp[index] * sp[index];
                    count++;
                }
                index++;
            }
        }

        var mean = sum / count;
        var variance = sumSquared / count - mean * mean;

        return {
            count: count,
            mean: mean,
            variance: variance,
            stdDev: Math.sqrt(variance)
        };

        return sum / count;
    }


    function onImageRendered(e)
    {
        var data = toolData[e.detail.element];

        if(data.lengthVisible == false)
        {
            return;
        }

        var width = Math.abs(data.startX - data.endX);
        var height = Math.abs(data.startY - data.endY);
        var radius = Math.max(width, height) / 2;
        var centerX = (data.startX + data.endX) / 2;
        var centerY = (data.startY + data.endY) / 2;


        var context = e.detail.canvasContext;
        context.beginPath();
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.stroke();
        context.fillStyle = "white";
        context.font = e.detail.mediumFontSize + " Arial";

        // TODO: calculate this in web worker for large pixel counts...
        var storedPixels = cornerstone.getStoredPixels(e.detail.element, centerX - radius, centerY - radius, radius * 2, radius *2);
        var meanStdDev = calculateMeanStdDev(storedPixels, radius);
        var text = "Mean: " + meanStdDev.mean.toFixed(2) + " StdDev: " + meanStdDev.stdDev.toFixed(2);
        context.fillText(text, centerX, centerY);
    };

    function enableCircleRoi(element, whichMouseButton)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);

        var eventData =
        {
            whichMouseButton: whichMouseButton,
            lengthVisible : false,
            startX : 0,
            startY : 0,
            endX : 0,
            endY : 0
        };

        toolData[element] = eventData;

        $(element).mousedown(onMouseDown);
    };

    function disableCircleRoi(element)
    {
        element.removeEventListener("CornerstoneImageRendered", onImageRendered);
        $(element).unbind('mousedown', onMouseDown);
        toolData[element] = undefined;
    };

    // module/private exports
    cornerstoneTools.enableCircleRoi = enableCircleRoi;
    cornerstoneTools.disableCircleRoi = disableCircleRoi;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // TODO: make a generic data storage mechanism for elements that
    //       gets cleaned up when the element is destroyed
    var lengthData = {};

    function onMouseDown(e) {
        var element = e.currentTarget;
        var data = lengthData[element];
        if(e.which == data.whichMouseButton) {
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            data.startX = coords.x;
            data.startY = coords.y;
            data.endX = coords.x;
            data.endY = coords.y;
            data.lengthVisible = true;

            $(document).mousemove(function(e) {
                var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
                data.endX = coords.x;
                data.endY = coords.y;
                cornerstone.updateImage(element);
            });

            $(document).mouseup(function(e) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        }
    };

    function onImageRendered(e)
    {
        var data = lengthData[e.detail.element];

        if(data.lengthVisible == false)
        {
            return;
        }

        var context = e.detail.canvasContext;
        context.beginPath();
        context.strokeStyle = 'white';
        context.lineWidth = 1;
        context.moveTo(data.startX, data.startY);
        context.lineTo(data.endX, data.endY);
        context.stroke();
        context.fillStyle = "white";
        context.font = e.detail.mediumFontSize + " Arial";
        var dx = data.startX - data.endX * e.detail.image.columnPixelSpacing;
        var dy = data.startY - data.endY * e.detail.image.rowPixelSpacing;
        var length = Math.sqrt(dx * dx + dy * dy);
        var text = "" + length.toFixed(2) + " mm";
        context.fillText(text, (data.startX + data.endX) / 2, (data.startY + data.endY) / 2);
    };

    function enableLength(element, whichMouseButton)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);

        var eventData =
        {
            whichMouseButton: whichMouseButton,
            lengthVisible : false,
            startX : 0,
            startY : 0,
            endX : 0,
            endY : 0
        };

        lengthData[element] = eventData;

        $(element).mousedown(onMouseDown);
    };

    function disableLength(element)
    {
        element.removeEventListener("CornerstoneImageRendered", onImageRendered);
        $(element).unbind('mousedown', onMouseDown);
        lengthData[element] = undefined;
    };

    // module/private exports
    cornerstoneTools.enableLength = enableLength;
    cornerstoneTools.disableLength = disableLength;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function pan(element, whichMouseButton){
        $(element).mousedown(function(e) {
            var lastX = e.pageX;
            var lastY = e.pageY;

            var mouseButton = e.which;

            if(mouseButton == whichMouseButton) {
                $(document).mousemove(function(e) {
                    var deltaX = e.pageX - lastX,
                        deltaY = e.pageY - lastY ;
                    lastX = e.pageX;
                    lastY = e.pageY;

                    var viewport = cornerstone.getViewport(element);
                    viewport.centerX += (deltaX / viewport.scale);
                    viewport.centerY += (deltaY / viewport.scale);
                    cornerstone.setViewport(element, viewport);
                });

                $(document).mouseup(function(e) {
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                });
            }
        });
    }


    // module/private exports
    cornerstoneTools.pan = pan;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // TODO: make a generic data storage mechanism for elements that
    //       gets cleaned up when the element is destroyed
    var dataList  = {};

    function onMouseDown(e) {
        var element = e.currentTarget;
        var data = dataList[element];
        if(e.which == data.whichMouseButton) {
            var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
            data.x = coords.x;
            data.y = coords.y;
            data.visible = true;

            $(document).mousemove(function(e) {
                var coords = cornerstone.pageToImage(element, e.pageX, e.pageY);
                data.x = coords.x;
                data.y = coords.y;
                cornerstone.updateImage(element);
            });

            $(document).mouseup(function(e) {
                data.visible = false;
                cornerstone.updateImage(element);
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        }
    };

    function onImageRendered(e)
    {
        var data = dataList[e.detail.element];

        if(data.visible == false)
        {
            return;
        }

        var context = e.detail.canvasContext;
        context.beginPath();
        context.fillStyle = "white";
        context.font = e.detail.mediumFontSize + " Arial";

        var storedPixels = cornerstone.getStoredPixels(e.detail.element, data.x, data.y, 1, 1);
        var sp = storedPixels[0];
        var mo = sp * e.detail.image.slope + e.detail.image.intercept;
        var text = "" + Math.round(data.x) + "," + Math.round(data.y) + " SP: " + sp + " MO: " + mo;
        context.fillText(text, data.x +3, data.y-3);
    };

    function enableProbe(element, whichMouseButton)
    {
        element.addEventListener("CornerstoneImageRendered", onImageRendered, false);

        var eventData =
        {
            whichMouseButton: whichMouseButton,
            visible : false,
            x : 0,
            y : 0
        };

        dataList[element] = eventData;

        $(element).mousedown(onMouseDown);
    };

    function disableProbe(element)
    {
        element.removeEventListener("CornerstoneImageRendered", onImageRendered);
        $(element).unbind('mousedown', onMouseDown);
        dataList[element] = undefined;
    };

    // module/private exports
    cornerstoneTools.enableProbe = enableProbe;
    cornerstoneTools.disableProbe = disableProbe;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function scroll(element, imageIds, whichMouseButton){
        var currentImageIdIndex = 0;
        if(whichMouseButton == 0) {
            $(element).on('mousewheel DOMMouseScroll', function(e) {
                // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
                // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
                if(e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
                    if(currentImageIdIndex < (imageIds.length - 1)) {
                        currentImageIdIndex++;
                        cornerstone.showImage(element, imageIds[currentImageIdIndex]);
                    }
                } else {
                    if(currentImageIdIndex > 0) {
                        currentImageIdIndex--;
                        cornerstone.showImage(element, imageIds[currentImageIdIndex]);
                    }
                }
                //prevent page fom scrolling
                return false;
            });
        }
        else {
            $(element).mousedown(function(e) {
                var lastX = e.pageX;
                var lastY = e.pageY;

                var mouseButton = e.which;

                if(mouseButton == whichMouseButton) {
                    $(document).mousemove(function(e) {
                        var deltaX = e.pageX - lastX,
                            deltaY = e.pageY - lastY ;
                        lastX = e.pageX;
                        lastY = e.pageY;

                        if(deltaY < 0) {
                            if(currentImageIdIndex < (imageIds.length - 1)) {
                                currentImageIdIndex++;
                                cornerstone.showImage(element, imageIds[currentImageIdIndex]);
                            }
                        } else if(deltaY > 0){
                            if(currentImageIdIndex > 0) {
                                currentImageIdIndex--;
                                cornerstone.showImage(element, imageIds[currentImageIdIndex]);
                            }
                        }
                    });

                    $(document).mouseup(function(e) {
                        $(document).unbind('mousemove');
                        $(document).unbind('mouseup');
                    });
                }
            });
        }

    }

    // module/private exports
    cornerstoneTools.scroll = scroll;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function onMouseDown(e) {
        var whichMouseButton = e.data.whichMouseButton;
        var lastX = e.pageX;
        var lastY = e.pageY;

        var mouseButton = e.which;

        if(mouseButton == whichMouseButton) {

            var element = e.currentTarget;

            $(document).mousemove(function(e) {
                var deltaX = e.pageX - lastX;
                var deltaY = e.pageY - lastY;
                lastX = e.pageX;
                lastY = e.pageY;

                var viewport = cornerstone.getViewport(element);
                viewport.windowWidth += (deltaX / viewport.scale);
                viewport.windowCenter += (deltaY / viewport.scale);
                cornerstone.setViewport(element, viewport);
            });

            $(document).mouseup(function(e) {
                $(document).unbind('mousemove');
                $(document).unbind('mouseup');
            });
        }
    };

    function windowWidthWindowCenter(element, whichMouseButton){
        var eventData =
        {
            whichMouseButton: whichMouseButton
        };
        $(element).mousedown(eventData, onMouseDown);
    }

    function disableWindowWidthWindowCenter(element){
        $(element).unbind('mousedown', onMouseDown);
    }


    // module/private exports
    cornerstoneTools.windowWidthWindowCenter = windowWidthWindowCenter;
    cornerstoneTools.disableWindowWidthWindowCenter = disableWindowWidthWindowCenter;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function zoom(element, whichMouseButton){
        if(whichMouseButton == 0) {
            $(element).on('mousewheel DOMMouseScroll', function(e) {
                // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
                // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
                if(e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0)
                {
                    var viewport = cornerstone.getViewport(element);
                    viewport.scale -= 0.25;
                    cornerstone.setViewport(element, viewport);
                } else {
                    var viewport = cornerstone.getViewport(element);
                    viewport.scale += 0.25;
                    cornerstone.setViewport(element, viewport);
                }
                //prevent page fom scrolling
                return false;
            });
        }
        else {
            $(element).mousedown(function(e) {
                var lastX = e.pageX;
                var lastY = e.pageY;

                var mouseButton = e.which;

                if(mouseButton == whichMouseButton) {
                    $(document).mousemove(function(e) {
                        var deltaX = e.pageX - lastX,
                            deltaY = e.pageY - lastY ;
                        lastX = e.pageX;
                        lastY = e.pageY;

                        var viewport = cornerstone.getViewport(element);
                        viewport.scale += (deltaY / 100);
                        cornerstone.setViewport(element, viewport);
                    });

                    $(document).mouseup(function(e) {
                        $(document).unbind('mousemove');
                        $(document).unbind('mouseup');
                    });
                }
            });
        }

    }


    // module/private exports
    cornerstoneTools.zoom = zoom;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));