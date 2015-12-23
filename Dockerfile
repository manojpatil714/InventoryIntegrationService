FROM centos

# Update ec2 instance
RUN yum update -y

# Enable Extra Packages for Enterprise Linux (EPEL) for CentOS
RUN     yum install -y epel-release
# Install Node.js and npm
RUN     yum install -y nodejs npm
# Install Git
# RUN yum groupinstall -y "Development Tools" (super big complete dev tools)

RUN yum install -y git
RUN yum install -y gettext-devel openssl-devel perl-CPAN perl-devel zlib-devel
RUN yum install -y wget
RUN yum install -y make
RUN yum install -y tar

# Make dir for our app
RUN	mkdir app

# Install app dependencies
COPY package.json /app/package.json
RUN cd /app; npm install

# Bundle app source
COPY . /app

# Get forever
RUN  npm install -g forever

EXPOSE  3002

CMD ["node --version"]
CMD ["npm --version"]
CMD ["git -version"]
CMD ["node", "/app/index.js"]