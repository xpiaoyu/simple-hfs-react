package main

import (
	"os"
)

func IsFileExisted(filename string) bool {
	_, err := os.Stat(filename)
	if err != nil {
		if os.IsNotExist(err) {
			// path is not existed
			return false
		} else {
			// unknown error
			return true
		}
	}
	return true
}
