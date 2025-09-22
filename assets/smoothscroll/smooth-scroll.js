(function() {
    // Define global variables and constants
    var isInitialized = false;
    var scrollContainer;
    var documentElement;
    var isScrolling = false;
    var lastScrollTimestamp = Date.now();
    var scrollEvents = [];
    var smoothScrollOptions = {
        frameRate: 150,
        animationTime: 400,
        stepSize: 100,
        pulseAlgorithm: true,
        pulseScale: 4,
        pulseNormalize: 1,
        accelerationDelta: 50,
        accelerationMax: 3,
        keyboardSupport: true,
        arrowScroll: 50,
        fixedBackground: true,
        excluded: ""
    };

    // Initialization function
    function initialize() {
        if (!isInitialized && document.body) {
            isInitialized = true;
            var body = document.body;
            var html = document.documentElement;
            var viewportHeight = window.innerHeight;
            var documentHeight = body.scrollHeight;

            scrollContainer = document.compatMode.indexOf("CSS") >= 0 ? html : body;
            documentElement = body;

            if (smoothScrollOptions.keyboardSupport) {
                window.addEventListener("keydown", handleKeydown, false);
            }

            if (top !== self) {
                isScrolling = true;
            } else if (documentHeight > viewportHeight && (body.offsetHeight <= viewportHeight || html.offsetHeight <= viewportHeight)) {
                var placeholder = document.createElement("div");
                placeholder.style.cssText = "position:absolute; z-index:-10000; top:0; left:0; right:0; height:" + scrollContainer.scrollHeight + "px";
                document.body.appendChild(placeholder);

                var resizeTimeout;
                var onResize = function() {
                    if (!resizeTimeout) {
                        resizeTimeout = setTimeout(function() {
                            placeholder.style.height = "0";
                            placeholder.style.height = scrollContainer.scrollHeight + "px";
                            resizeTimeout = null;
                        }, 500);
                    }
                };

                setTimeout(onResize, 10);
                window.addEventListener("resize", onResize, false);

                var mutationObserver = new MutationObserver(onResize);
                mutationObserver.observe(body, {
                    attributes: true,
                    childList: true,
                    characterData: false
                });

                if (body.offsetHeight <= viewportHeight) {
                    var clearDiv = document.createElement("div");
                    clearDiv.style.clear = "both";
                    body.appendChild(clearDiv);
                }
            }

            if (!smoothScrollOptions.fixedBackground) {
                body.style.backgroundAttachment = "scroll";
                html.style.backgroundAttachment = "scroll";
            }
        }
    }

    // Smooth scrolling handler function
    function smoothScroll(target, x, y) {
        adjustScrollDirection(x, y);
        if (smoothScrollOptions.accelerationMax !== 1) {
            var currentTime = Date.now();
            var timeDiff = currentTime - lastScrollTimestamp;
            if (timeDiff < smoothScrollOptions.accelerationDelta) {
                var acceleration = (1 + 50 / timeDiff) / 2;
                if (acceleration > 1) {
                    acceleration = Math.min(acceleration, smoothScrollOptions.accelerationMax);
                    x *= acceleration;
                    y *= acceleration;
                }
            }
            lastScrollTimestamp = currentTime;
        }
        scrollEvents.push({
            x: x,
            y: y,
            lastX: x < 0 ? 0.99 : -0.99,
            lastY: y < 0 ? 0.99 : -0.99,
            start: Date.now()
        });

        if (!isScrolling) {
            var scrollElement = getScrollElement(target);
            if (!scrollElement) {
                if (isScrolling && window.scrollBy) {
                    parent.wheel({ target: window.frameElement });
                }
                return;
            }

            var onScroll = function() {
                var currentTime = Date.now();
                var deltaX = 0;
                var deltaY = 0;

                for (var i = 0; i < scrollEvents.length; i++) {
                    var event = scrollEvents[i];
                    var timeElapsed = currentTime - event.start;
                    var progress = timeElapsed >= smoothScrollOptions.animationTime ? 1 : timeElapsed / smoothScrollOptions.animationTime;

                    if (smoothScrollOptions.pulseAlgorithm) {
                        progress = progress <= 1 ? pulse(progress) : 1;
                    }

                    deltaX += (event.x * progress - event.lastX) >> 0;
                    deltaY += (event.y * progress - event.lastY) >> 0;

                    event.lastX += deltaX;
                    event.lastY += deltaY;

                    if (timeElapsed >= smoothScrollOptions.animationTime) {
                        scrollEvents.splice(i, 1);
                        i--;
                    }
                }

                if (scrollElement === document.body) {
                    window.scrollBy(deltaX, deltaY);
                } else {
                    if (deltaX) {
                        target.scrollLeft += deltaX;
                    }
                    if (deltaY) {
                        target.scrollTop += deltaY;
                    }
                }

                if (!scrollEvents.length) {
                    isScrolling = false;
                    if (scrollElement.$scrollBehavior) {
                        target.style.scrollBehavior = scrollElement.$scrollBehavior;
                        scrollElement.$scrollBehavior = null;
                    }
                }
            };

            requestAnimationFrame(onScroll);
            isScrolling = true;
        }
    }

    // Keydown event handler
    function handleKeydown(event) {
        var target = event.target;
        var isModifiedKey = event.ctrlKey || event.altKey || event.metaKey || (event.shiftKey && event.keyCode !== keys.spacebar);
        var isScrollable = !(target.nodeName === "TEXTAREA" || target.nodeName === "SELECT" || target.nodeName === "EMBED" || target.nodeName === "OBJECT" || target.shadowRoot);

        if (event.defaultPrevented || isModifiedKey || !isScrollable) {
            return;
        }

        var scrollDirection = 0;
        var scrollAmount = 0;
        var scrollElement = getScrollElement(document.activeElement);

        if (!scrollElement) {
            if (isScrolling) {
                parent.keydown(event);
            }
            return;
        }

        var clientHeight = scrollElement.clientHeight;

        switch (event.keyCode) {
            case keys.up:
                scrollDirection = -smoothScrollOptions.arrowScroll;
                break;
            case keys.down:
                scrollDirection = smoothScrollOptions.arrowScroll;
                break;
            case keys.spacebar:
                scrollDirection = event.shiftKey ? 1 : -1;
                scrollDirection *= clientHeight * 0.9;
                break;
            case keys.pageup:
                scrollDirection = -clientHeight * 0.9;
                break;
            case keys.pagedown:
                scrollDirection = clientHeight * 0.9;
                break;
            case keys.home:
                scrollDirection = -scrollElement.scrollTop;
                break;
            case keys.end:
                scrollAmount = scrollElement.scrollHeight - scrollElement.scrollTop - clientHeight;
                scrollDirection = scrollAmount > 0 ? scrollAmount + 10 : 0;
                break;
            case keys.left:
                scrollDirection = -smoothScrollOptions.arrowScroll;
                break;
            case keys.right:
                scrollDirection = smoothScrollOptions.arrowScroll;
                break;
            default:
                return;
        }

        smoothScroll(scrollElement, 0, scrollDirection);
        event.preventDefault();
        resetScrollTimeout();
    }

    // Utility functions
    function getScrollElement(element) {
        var scrollElements = [];
        var body = document.body;
        var scrollContainerHeight = scrollContainer.scrollHeight;

        while (element) {
            var scrollElement = H[getUniqueId(element)];
            if (scrollElement) {
                return scrollElement;
            }
            scrollElements.push(element);

            if (scrollContainerHeight === element.scrollHeight) {
                if (element === document.body || isScrollable(element)) {
                    return O();
                }
            } else if (element.clientHeight + 10 < element.scrollHeight && isOverflowAutoOrScroll(element)) {
                return element;
            }

            element = element.parentElement;
        }

        return null;
    }

    function isScrollable(element) {
        return getComputedStyle(element).overflowY !== "hidden";
    }

    function isOverflowAutoOrScroll(element) {
        var overflowY = getComputedStyle(element).overflowY;
        return overflowY === "scroll" || overflowY === "auto";
    }

    function pulse(progress) {
        progress *= smoothScrollOptions.pulseScale;
        return progress < 1 ? progress - (1 - Math.exp(-progress)) : Math.exp(-1) + (1 - Math.exp(-(progress - 1))) * (1 - Math.exp(-1));
    }

    function adjustScrollDirection(x, y) {
        var xDirection = x < 0 ? 1 : -1;
        var yDirection = y < 0 ? 1 : -1;
        if (B.x !== xDirection || B.y !== yDirection) {
            B.x = xDirection;
            B.y = yDirection;
            scrollEvents = [];
            lastScrollTimestamp = Date.now();
        }
    }

    function getUniqueId(element) {
        return element.uniqueID || (element.uniqueID = Date.now());
    }

    function resetScrollTimeout() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setInterval(function() {
            scrollEvents = [];
        }, 1000);
    }

    var keys = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        spacebar: 32,
        pageup: 33,
        pagedown: 34,
        home: 36,
        end: 35
    };

    var scrollTimeout;
    var B = { x: 0, y: 0 };

    // Initialize on load
    window.addEventListener("load", initialize, false);
})();
