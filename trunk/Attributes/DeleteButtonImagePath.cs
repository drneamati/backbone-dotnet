﻿using System;
using System.Collections.Generic;
using System.Text;

namespace Org.Reddragonit.BackBoneDotNet.Attributes
{
    /*
     * Used to indicate an image for a delete button instead of the base code.  
     * Specify the image url for a given host and it will generate the delete button with the image
     * including the event triggers.  Only used when using the default View code generator.
     */
    [AttributeUsage(AttributeTargets.Class,AllowMultiple=false)]
    public class DeleteButtonImagePath : Attribute
    {
        private string _url;
        public string URL
        {
            get { return _url; }
        }

        private string _host;
        public string Host
        {
            get { return _host; }
        }

        public DeleteButtonImagePath(string url)
            : this(null, url) { }

        public DeleteButtonImagePath(string host,string url)
        {
            _host = (host == null ? "*" : (host == "" ? "*" : host));
            _url = url;
        }
    }
}
