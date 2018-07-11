# splunk4good-chrome-plugin
Splunk Chrome extension for the colorblind and the disabled that have difficulty in typing

## SPL Test strings:
index=appinspect "attrs.appinspect-env"="*v2-prod" ("attrs.appinspect-service"=api OR "attrs.appinspect-service"=worker) Splunk_AppInspect_Validate_v1.0  earliest=-120m@m latest=-60m@m | rex field=_raw "(?:id':\s+'|Splunk_AppInspect_Validate_v1.0\[)(?P<request_id>(?:[^'\]])+)" | transaction request_id | eval start_time=_time | eval finish_time=IF(duration > 0, start_time+duration, null()) | eval myduration=IF(isnotnull(finish_time), finish_time-start_time, time()-start_time-3600) | where myduration>1800 | eval has_start=if(like(line,"%Received task%"),"YES","NO") | where has_start == "YES" | table request_id duration start_time finish_time myduration has_start

## Some useful patterns:
1. aloha <br>
2. index is internal <br>
3. type is splunk <br>
4. where name contains hello <br>
5. where count between 1 and 10 <br>
6. where count greater than 10 <br>
7. where count less than 20 <br>
8. where name is splunk <br>
9. search hello <br>
10. let's have fun <br>
11. stop search <br>
12. commit <br>
13. rollback <br>
14. aloha commit <br>
15. aloha rollback <br>