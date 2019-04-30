package main

import (
	"io/ioutil"
	"encoding/json"
	"os"
	"github.com/valyala/fasthttp"
	"io"
)

type SimpleFileInfo struct {
	Name      string
	IsDir     bool
	Size      int64
	Timestamp int64
}

const (
	FasthttpAddr = ":8082"

	RouteListFile = "/list"
	RouteFavicon  = "/favicon.ico"
	RouteUpload   = "/upload"
	RouteDownload = "/download"

	ContentTypeJson = "application/json"
)

func main() {
	firstHandler := func(c *fasthttp.RequestCtx) {
		c.Response.Header.Add("Access-Control-Allow-Origin", "*")
		switch string(c.Path()) {
		case RouteListFile:
			listFileHandler(c)
		case RouteUpload:
			uploadHandler(c)
		case RouteFavicon:
			c.SetStatusCode(304)
		case RouteDownload:
			downloadHandler(c)
		default:
			c.SetStatusCode(401)
			c.WriteString("Unrecognized request.")
		}
	}
	fasthttp.ListenAndServe(FasthttpAddr, firstHandler)
}

func downloadHandler(c *fasthttp.RequestCtx) {
	path := string(c.QueryArgs().Peek("filename"))
	fullPath := "assets" + path
	fInfo, err := os.Stat(fullPath)
	if err == nil {
		c.Response.Header.Set("Content-Disposition", "attachment; filename=\""+fInfo.Name()+"\"")
	} else {
		c.WriteString(err.Error())
		return
	}
	c.SendFile(fullPath)
}

func uploadHandler(c *fasthttp.RequestCtx) {
	if string(c.Method()) == "OPTIONS" {
		c.SetStatusCode(204)
		c.Response.Header.Set("access-control-allow-headers", "authorization,x-requested-with")
		return
	}
	file, err := c.FormFile("file")
	if err != nil {
		DebugPrintln("[error]", err)
	} else {
		path := string(c.QueryArgs().Peek("path"))
		fullName := "assets" + path + file.Filename
		DebugPrintln("[debug]", file.Filename, file.Size, path)
		fp, err := file.Open()
		if err != nil {
			c.SetStatusCode(fasthttp.StatusBadRequest)
			return
		}
		defer fp.Close()
		if IsFileExisted(fullName) {
			c.SetStatusCode(fasthttp.StatusBadRequest)
			c.WriteString("File existed.")
			return
		} else {
			fpLocal, err := os.Create(fullName)
			if err != nil {
				c.SetStatusCode(fasthttp.StatusInternalServerError)
				c.WriteString("Can't create file: " + fullName)
				return
			}
			defer fpLocal.Close()
			io.Copy(fpLocal, fp)
			return
		}
	}
}

func listFileHandler(c *fasthttp.RequestCtx) {
	path := string(c.QueryArgs().Peek("path"))
	c.SetContentType(ContentTypeJson)
	json.NewEncoder(c).Encode(listDir(path))
}

// Relative path to the directory "assets"
func listDir(path string) (result []SimpleFileInfo) {
	files, err := ioutil.ReadDir("assets" + path)
	if err != nil {
		DebugPrintln("[error] ioutil.ReadDir failed err:", err)
	}
	for _, v := range files {
		result = append(result, SimpleFileInfo{
			Name:      v.Name(),
			IsDir:     v.IsDir(),
			Size:      v.Size(),
			Timestamp: v.ModTime().Unix(),
		})
	}
	json.NewEncoder(os.Stdout).Encode(result)
	return
}
