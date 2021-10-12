"use strict";
(() => {
var exports = {};
exports.id = "pages/course/[department]/[coursenumber]";
exports.ids = ["pages/course/[department]/[coursenumber]"];
exports.modules = {

/***/ "./src/pages/course/[department]/[coursenumber]/index.tsx":
/*!****************************************************************!*\
  !*** ./src/pages/course/[department]/[coursenumber]/index.tsx ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CoursePage)
/* harmony export */ });
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/router */ "next/router");
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-dev-runtime */ "react/jsx-dev-runtime");
/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__);
var _jsxFileName = "C:\\Users\\nich1\\Documents\\MiddCourses2\\src\\pages\\course\\[department]\\[coursenumber]\\index.tsx";


function CoursePage() {
  const router = (0,next_router__WEBPACK_IMPORTED_MODULE_0__.useRouter)(); //const {dept,number}: any = router.query;

  const {
    department,
    coursenumber
  } = router.query;
  console.log(coursenumber); //do page api logic here, and check if course exists, else display 404

  return /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)("div", {
    children: /*#__PURE__*/(0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__.jsxDEV)("h1", {
      children: department + " " + coursenumber
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 14,
      columnNumber: 7
    }, this)
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 13,
    columnNumber: 5
  }, this);
}

/***/ }),

/***/ "next/router":
/*!******************************!*\
  !*** external "next/router" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("next/router");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./src/pages/course/[department]/[coursenumber]/index.tsx"));
module.exports = __webpack_exports__;

})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZXMvY291cnNlL1tkZXBhcnRtZW50XS9bY291cnNlbnVtYmVyXS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBRWUsU0FBU0MsVUFBVCxHQUFzQjtBQUNuQyxRQUFNQyxNQUFrQixHQUFHRixzREFBUyxFQUFwQyxDQURtQyxDQUVuQzs7QUFDQSxRQUFNO0FBQUVHLElBQUFBLFVBQUY7QUFBY0MsSUFBQUE7QUFBZCxNQUFvQ0YsTUFBTSxDQUFDRyxLQUFqRDtBQUNBQyxFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWUgsWUFBWixFQUptQyxDQU1uQzs7QUFHQSxzQkFDRTtBQUFBLDJCQUNFO0FBQUEsZ0JBQUtELFVBQVUsR0FBRyxHQUFiLEdBQW1CQztBQUF4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBREY7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQURGO0FBS0Q7Ozs7Ozs7Ozs7QUNoQkQ7Ozs7Ozs7Ozs7QUNBQSIsInNvdXJjZXMiOlsid2VicGFjazovL2FwcC8uL3NyYy9wYWdlcy9jb3Vyc2UvW2RlcGFydG1lbnRdL1tjb3Vyc2VudW1iZXJdL2luZGV4LnRzeCIsIndlYnBhY2s6Ly9hcHAvZXh0ZXJuYWwgXCJuZXh0L3JvdXRlclwiIiwid2VicGFjazovL2FwcC9leHRlcm5hbCBcInJlYWN0L2pzeC1kZXYtcnVudGltZVwiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSb3V0ZXIsIHVzZVJvdXRlciB9IGZyb20gXCJuZXh0L3JvdXRlclwiO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ291cnNlUGFnZSgpIHtcclxuICBjb25zdCByb3V0ZXI6IE5leHRSb3V0ZXIgPSB1c2VSb3V0ZXIoKTtcclxuICAvL2NvbnN0IHtkZXB0LG51bWJlcn06IGFueSA9IHJvdXRlci5xdWVyeTtcclxuICBjb25zdCB7IGRlcGFydG1lbnQsIGNvdXJzZW51bWJlciB9OiBhbnkgPSByb3V0ZXIucXVlcnk7XHJcbiAgY29uc29sZS5sb2coY291cnNlbnVtYmVyKTtcclxuXHJcbiAgLy9kbyBwYWdlIGFwaSBsb2dpYyBoZXJlLCBhbmQgY2hlY2sgaWYgY291cnNlIGV4aXN0cywgZWxzZSBkaXNwbGF5IDQwNFxyXG5cclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXY+XHJcbiAgICAgIDxoMT57ZGVwYXJ0bWVudCArIFwiIFwiICsgY291cnNlbnVtYmVyfTwvaDE+XHJcbiAgICA8L2Rpdj5cclxuICApO1xyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm5leHQvcm91dGVyXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInJlYWN0L2pzeC1kZXYtcnVudGltZVwiKTsiXSwibmFtZXMiOlsidXNlUm91dGVyIiwiQ291cnNlUGFnZSIsInJvdXRlciIsImRlcGFydG1lbnQiLCJjb3Vyc2VudW1iZXIiLCJxdWVyeSIsImNvbnNvbGUiLCJsb2ciXSwic291cmNlUm9vdCI6IiJ9