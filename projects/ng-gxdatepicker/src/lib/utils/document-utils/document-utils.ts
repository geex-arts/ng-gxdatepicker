

export function hasClass(element, className) {
  return element.className.split(' ').indexOf(className) != -1;
}

export function addClass(element, className) {
  if (!hasClass(element, className)) {
    element.className += ' ' + className;
  }
}

export function removeClass(element, className) {
  element.className = element.className.split(' ').filter(item => item != className).join(' ');
}

export function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return rect.left < window.innerWidth && rect.right > 0 && rect.top < window.innerHeight && rect.bottom > 0;
}

export function getOffset(element, relativeTo = null) {
  let x = 0;
  let y = 0;

  while (element && !isNaN(element.offsetLeft) && !isNaN(element.offsetTop)) {
    x += element.offsetLeft - element.scrollLeft;
    y += element.offsetTop - element.scrollTop;
    element = element.offsetParent;

    if (relativeTo && element == relativeTo) {
      break;
    }
  }

  return { top: y, left: x };
}

export function getSize(element) {
  return { width: element.offsetWidth, height: element.offsetHeight };
}
