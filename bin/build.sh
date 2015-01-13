#!/bin/bash

while getopts ":d:" o; do
  case "${o}" in
    d)
        BUILD_DIR=${OPTARG}
        ;;
    *)
        ;;
  esac
done
shift $((OPTIND-1))

if [ -z "$PHP" ]; then
    PHP=`which php`
fi

cd build/rome
${PHP} build.php --ver=7.6.0 --flav=ult --clean=1 --cleanCache=1 --build_dir=${BUILD_DIR} --retainCommentSpacing=1 --sidecar
