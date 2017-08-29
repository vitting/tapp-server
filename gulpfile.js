const gulp = require("gulp");
const rm = require("gulp-rm");
const sourceFiles = ["../TolkeAppClient/dist/**/*"];
const destination = "public/";
const destClean = "public/**/*";

gulp.task("clean", function () {
    return gulp.src(destClean, {read: false})
        .pipe(rm());
});

gulp.task("copyclient", ["clean"], function () {
    return gulp.src(sourceFiles).pipe(gulp.dest(destination));
});
