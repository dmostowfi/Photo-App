#
# Client-side python app for photoapp, this time working with
# web service, which in turn uses AWS S3 and RDS to implement
# a simple photo application for photo storage and viewing.
#
# Project 02 for CS 310, Spring 2023.
#
# Authors:
#   Deanna Mostowfi
#   Prof. Joe Hummel (initial template)
#   Northwestern University
#   Spring 2023
#

import requests  # calling web service
import jsons  # relational-object mapping

import uuid
import pathlib
import logging
import sys
import os
import base64

from configparser import ConfigParser

import matplotlib.pyplot as plt
import matplotlib.image as img


###################################################################
#
# classes
#
class User:
  userid: int  # these must match columns from DB table
  email: str
  lastname: str
  firstname: str
  bucketfolder: str


class Asset:
  assetid: int  # these must match columns from DB table
  userid: int
  assetname: str
  bucketkey: str


class BucketItem:
  Key: str      # these must match columns from DB table
  LastModified: str
  ETag: str
  Size: int
  StorageClass: str


###################################################################
#
# prompt
#
def prompt():
  """
  Prompts the user and returns the command number
  
  Parameters
  ----------
  None
  
  Returns
  -------
  Command number entered by user (0, 1, 2, ...)
  """
  print()
  print(">> Enter a command:")
  print("   0 => end")
  print("   1 => stats")
  print("   2 => users")
  print("   3 => assets")
  print("   4 => download")
  print("   5 => download and display")
  print("   6 => bucket contents")
  print("   7 => image")

  cmd = int(input())
  return cmd


###################################################################
#
# stats
#
def stats(baseurl):
  """
  Prints out S3 and RDS info: bucket status, # of users and 
  assets in the database
  
  Parameters
  ----------
  baseurl: baseurl for web service
  
  Returns
  -------
  nothing
  """

  try:
    #
    # call the web service:
    #
    api = '/stats'
    url = baseurl + api

    res = requests.get(url)
    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return

    #
    # deserialize and extract stats:
    #
    body = res.json()
    #
    print("bucket status:", body["message"])
    print("# of users:", body["db_numUsers"])
    print("# of assets:", body["db_numAssets"])

  except Exception as e:
    logging.error("stats() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return


###################################################################
#
# users
#
def users(baseurl):
  """
  Prints out all the users in the database
  
  Parameters
  ----------
  baseurl: baseurl for web service
  
  Returns
  -------
  nothing
  """

  try:
    #
    # call the web service:
    #
    api = '/users'
    url = baseurl + api

    res = requests.get(url)

    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return

    #
    # deserialize and extract users:
    #
    body = res.json()
    #print(body) #at this point, response comes back in json
    #
    # let's map each dictionary into a User object:
    #
    users = []
    for row in body["data"]:
      user = jsons.load(row, User)
      users.append(user)
    #
    # Now we can think OOP:
    #
    for user in users:
      print(user.userid)
      print(" ", user.email)
      print(" ", user.lastname, ",", user.firstname)
      print(" ", user.bucketfolder)

  except Exception as e:
    logging.error("users() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return

###################################################################
#
# assets
#
def assets(baseurl):

  try:
    #
    # call the web service:
    #
    api = '/assets'
    url = baseurl + api

    res = requests.get(url) #sending request to server

    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return

    #
    # deserialize and extract assets:
    #
    body = res.json()
    #
    # let's map each dictionary into an Asset object:
    #
    assets = []
    for row in body["data"]:
      asset = jsons.load(row, Asset)
      assets.append(asset)
    #
    # Now we can think OOP:
    #
    for asset in assets:
      print(asset.assetid)
      print(" ", asset.userid)
      print(" ", asset.assetname)
      print(" ", asset.bucketkey)

  except Exception as e:
    #exception represents some kind of undefined behavior
    #logging.error is to log exceptions
    logging.error("assets() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return


###################################################################
#
# download
#
def download(baseurl, display):

  try:
    #
    # call the web service:
    #
    api = '/download'
    print("Enter asset id>")
    assetid = input()
    url = baseurl + api + "/" + assetid

    res = requests.get(url)

    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return

    #
    # deserialize the response
    #
    
    body = res.json()
    
    if body["user_id"] == -1:
      print("No such asset...")
      return
    else:
      decoded = base64.b64decode(body["data"]) #decoding the data
      outfile = open(body["asset_name"], "wb") #open new binary file called outfile 
      outfile.write(decoded) #writing decoded data into outfile
      # Now we can think OOP:
      print("userid:", body["user_id"])
      print("asset name:", body["asset_name"])
      print("bucket key:", body["bucket_key"])
      print("Downloaded from S3 and saved as ' %s '" % body["asset_name"])
      if display == 1:
        image = img.imread(body["asset_name"])
        plt.imshow(image)
        plt.show()

  except Exception as e:
    logging.error("download() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return

###################################################################
#
# bucket
#
def bucket(baseurl):

  try:
    #
    # call the web service:
    #
    api = '/bucket'
    url = baseurl + api
    

    res = requests.get(url)

    while True:
      #
      # let's look at what we got back:
      #
      if res.status_code != 200:
        # failed:
        print("Failed with status code:", res.status_code)
        print("url: " + url)
        if res.status_code == 400:  # we'll have an error message
          body = res.json()
          print("Error message:", body["message"])
        #
        return
      #
      # deserialize the response
      #
      
      body = res.json() #should return max 12 items
      #print(body["data"])
      # let's map each dictionary into a Bucket object:
      #
      if body["data"] == []:
        return
      else:
        asset_list = []
        for row in body["data"]:
          bucketitem = jsons.load(row, BucketItem)
          asset_list.append(bucketitem)
        last_element = asset_list[-1].Key
      
      #if server returns zero items, don't return anything
      #if len(asset_list) == 0:
      #  return
      
      #print("key last element: ", last_element)
      #
      # Now we can think OOP:
      #
      for item in asset_list: 
        print(item.Key)
        print(" ", item.LastModified)
        print(" ", item.Size)
      print("another page? [y/n]")
      another_page = input()
      if another_page == "y":
        url = baseurl + api + "?startafter=" + last_element
        res = requests.get(url)
      else:
        return
      

  except Exception as e:
    logging.error("bucket() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return

###################################################################
#
# image  part 2
#
def image(baseurl):

  try:
    #
    # call the web service:
    #
    api = '/image'
    userid = input()
    url = baseurl + api + "/" + userid

    B = open('mario.jpg', 'rb')
    #read the contents
    byteB = bytearray(B.read())
    B.close()  #close the file??
    E = base64.b64encode(byteB) #encode as base64
    S = E.decode() #convert E to string S
    
    data = {
      "assetname": 'mario.jpg', 
      "data": S
    }

  
    #post data to server
    res = requests.post(url, json = data)  
    print(res.status_code)
    
    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code == 400:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return


  except Exception as e:
    logging.error("image() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return


#########################################################################
# main
#
print('** Welcome to PhotoApp v2 **')
print()

# eliminate traceback so we just get error message:
sys.tracebacklimit = 0

#
# what config file should we use for this session?
#
config_file = 'photoapp-client-config'

print("What config file to use for this session?")
print("Press ENTER to use default (photoapp-config),")
print("otherwise enter name of config file>")
s = input()

if s == "":  # use default
  pass  # already set
else:
  config_file = s

#
# does config file exist?
#
if not pathlib.Path(config_file).is_file():
  print("**ERROR: config file '", config_file, "' does not exist, exiting")
  sys.exit(0)

#
# setup base URL to web service:
#
configur = ConfigParser()
configur.read(config_file)
baseurl = configur.get('client', 'webservice')

# print(baseurl)

#
# main processing loop:
#
cmd = prompt()

while cmd != 0:
  #
  if cmd == 1:
    stats(baseurl)
  elif cmd == 2:
    users(baseurl)
  elif cmd == 3:
    assets(baseurl)
  elif cmd == 4:
    download(baseurl, 0)
  elif cmd == 5:
    download(baseurl, 1)
  elif cmd == 6:
    bucket(baseurl)
  elif cmd == 7:
    image(baseurl)
  else:
    print("** Unknown command, try again...")
  #
  cmd = prompt()

#
# done
#
print()
print('** done **')
