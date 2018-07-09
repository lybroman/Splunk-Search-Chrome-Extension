# splunk4good-chrome-plugin
Splunk Chrome extension for the colorblind and the disabled that have difficulty in typing

## SPL Test strings:
index=appinspect "attrs.appinspect-env"="*v2-prod" ("attrs.appinspect-service"=api OR "attrs.appinspect-service"=worker) Splunk_AppInspect_Validate_v1.0  earliest=-120m@m latest=-60m@m | rex field=_raw "(?:id':\s+'|Splunk_AppInspect_Validate_v1.0\[)(?P<request_id>(?:[^'\]])+)" | transaction request_id | eval start_time=_time | eval finish_time=IF(duration > 0, start_time+duration, null()) | eval myduration=IF(isnotnull(finish_time), finish_time-start_time, time()-start_time-3600) | where myduration>1800 | eval has_start=if(like(line,"%Received task%"),"YES","NO") | where has_start == "YES" | table request_id duration start_time finish_time myduration has_start
