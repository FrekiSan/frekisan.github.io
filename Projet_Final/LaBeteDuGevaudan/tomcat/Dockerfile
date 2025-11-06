FROM tomcat:9-jdk

# Activer manager/host-manager
RUN cp -R /usr/local/tomcat/webapps.dist/manager /usr/local/tomcat/webapps/ \
 && cp -R /usr/local/tomcat/webapps.dist/host-manager /usr/local/tomcat/webapps/

# Users + valve pour accès
COPY tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY manager-context.xml /usr/local/tomcat/webapps/manager/META-INF/context.xml
COPY manager-context.xml /usr/local/tomcat/webapps/host-manager/META-INF/context.xml
