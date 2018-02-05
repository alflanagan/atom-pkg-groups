#!/usr/bin/env dash

if [ $# -lt 1 ]; then
  echo "$(basename $0)"
  echo "    Searches source files for a match to the find parameters given, must include an action"
  echo "    (i.e. -print, -exec, etc.)"
  echo "  Example:"
  echo "    ./search_code.sh -exec grep packagesWithState '{}' +"
else
  find . -name babel-transpile -prune -o -name docs -prune -o -name .git -prune -o -name node_modules -prune -o -name '*.js' "$@"
fi
