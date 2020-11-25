'use srict'

let trim = (x) => {
  let value = String(x)
  return value.replace(/^\s+|\s+$/gm, '')
}
let isEmpty = (value) => {
  if (value === null || value === undefined || trim(value) === '' || value.length === 0) {
    return true
  } else {
    return false
  }
}

let isAdmin = (value) => {
  if (value.endsWith('admin') || value.endsWith('Admin')) { //if last name ends withAdmin, then grant that person admin permission
    return true;
  }
  else {
    return false;
  }
}

module.exports = {
  isEmpty: isEmpty,
  isAdmin: isAdmin
}
