from __future__ import print_function
import time
from os import system
from activity import *
import json
import datetime
import sys
import os

if sys.platform in ["Windows", "win32", "cygwin"]:
    import win32gui
    import uiautomation as auto
    import subprocess
elif sys.platform in ["Mac", "darwin", "os2", "os2emx"]:
    from AppKit import NSWorkspace
    from Foundation import *
elif sys.platform in ["linux", "linux2"]:
    import linux as l

active_window_name = ""
activity_name = ""
start_time = datetime.datetime.now()
activeList = AcitivyList([])
first_time = True

# Change directory to the root of the os
# If os is windows, change to the root of the drive
if sys.platform in ["Windows", "win32", "cygwin"]:
    path = "C:\\SystemData\\JSON"
    os.makedirs(path, exist_ok=True)
    os.chdir(path)
elif sys.platform in ["Mac", "darwin", "os2", "os2emx"]:
    path = "/SystemData/JSON"
    os.makedirs(path, exist_ok=True)
    os.chdir(path)
elif sys.platform in ["linux", "linux2"]:
    path = "/SystemData/JSON"
    os.makedirs(path, exist_ok=True)
    os.chdir(path)


# List all of the processes in the .pid file
if os.path.exists(".pid"):
    with open(".pid", "r") as pid_file:
        for line in pid_file:
            si = subprocess.STARTUPINFO()
            si.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            subprocess.call("taskkill /F /PID " + line, startupinfo=si)

    # Delete the .pid file
    try:
        os.remove(".pid")
    except Exception as e:
        print(e)

# Create a new .pid file
with open(".pid", "w") as pid_file:
    # Write the current process ID to the .pid file
    pid_file.write(str(os.getpid()))


def url_to_name(url):
    string_list = url.split("/")
    # If using Google, Yahoo or Bing, Get the search query instead
    if "google" in url:
        string_list = url.split("q=")
        string_list = string_list[1].split("&")
        result = string_list[0] + " - Google"
        result = result.replaceAll('+', ' ')
        return string_list[0] + " - Google"
    elif "yahoo" in url:
        string_list = url.split("p=")
        string_list = string_list[1].split("&")
        result =  string_list[0] + " - Yahoo"
        result = result.replaceAll('+', ' ')
        return
    elif "bing" in url:
        string_list = url.split("q=")
        string_list = string_list[1].split("&")
        result = string_list[0] + " - Bing"
        result = result.replaceAll('+', ' ')
        return string_list[0] + " - Bing"
    elif "duckduckgo" in url:
        string_list = url.split("q=")
        string_list = string_list[1].split("&")
        result = string_list[0] + " - DuckDuckGo"
        result = result.replaceAll('+', ' ')
        return string_list[0] + " - DuckDuckGo"
    else:
        return string_list[2]


def get_active_window():
    _active_window_name = None
    if sys.platform in ["Windows", "win32", "cygwin"]:
        window = win32gui.GetForegroundWindow()
        _active_window_name = win32gui.GetWindowText(window)
    elif sys.platform in ["Mac", "darwin", "os2", "os2emx"]:
        _active_window_name = NSWorkspace.sharedWorkspace().activeApplication()[
            "NSApplicationName"
        ]
    else:
        print("sys.platform={platform} is not supported.".format(platform=sys.platform))
        print(sys.version)
    return _active_window_name


def get_chrome_url():
    if sys.platform in ["Windows", "win32", "cygwin"]:
        window = win32gui.GetForegroundWindow()
        chromeControl = auto.ControlFromHandle(window)
        edit = chromeControl.EditControl()
        try:
            return "https://" + edit.GetValuePattern().Value
        except:
            return 0
    elif sys.platform in ["Mac", "darwin", "os2", "os2emx"]:
        textOfMyScript = (
            """tell app "google chrome" to get the url of the active tab of window 1"""
        )
        s = NSAppleScript.initWithSource_(NSAppleScript.alloc(), textOfMyScript)
        results, err = s.executeAndReturnError_(None)
        return results.stringValue()
    else:
        print("sys.platform={platform} is not supported.".format(platform=sys.platform))
        print(sys.version)
    return _active_window_name


try:
    activeList.initialize_me()
except Exception:
    print("No json")


try:
    while True:
        previous_site = ""
        if sys.platform not in ["linux", "linux2"]:
            new_window_name = get_active_window()
            if "Google Chrome" in new_window_name:
                url = get_chrome_url()
                if url != 0:
                    new_window_name = url_to_name(get_chrome_url())
            if "Microsoft Edge" in new_window_name:
                url = get_chrome_url()
                if url != 0:
                    new_window_name = url_to_name(get_chrome_url())
        if sys.platform in ["linux", "linux2"]:
            new_window_name = l.get_active_window_x()
            if "Google Chrome" in new_window_name:
                new_window_name = l.get_chrome_url_x()
            if "Microsoft Edge" in new_window_name:
                new_window_name = l.get_chrome_url_x()

        if active_window_name != new_window_name:
            activity_name = active_window_name

            if not first_time:
                end_time = datetime.datetime.now()
                time_entry = TimeEntry(start_time, end_time, 0, 0, 0, 0)
                time_entry._get_specific_times()

                exists = False
                for activity in activeList.activities:
                    if activity.name == activity_name:
                        exists = True
                        activity.time_entries.append(time_entry)

                if not exists:
                    print(activity_name)
                    activity = Activity(activity_name, [time_entry])
                    activeList.activities.append(activity)
                with open("activities.json", "w") as json_file:
                    json.dump(
                        activeList.serialize(), json_file, indent=4, sort_keys=True
                    )
                    start_time = datetime.datetime.now()
            first_time = False
            active_window_name = new_window_name

        time.sleep(1)

except KeyboardInterrupt:
    with open("activities.json", "w") as json_file:
        json.dump(activeList.serialize(), json_file, indent=4, sort_keys=True)