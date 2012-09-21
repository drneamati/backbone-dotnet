﻿using System;
using System.Collections.Generic;
using System.Text;
using Org.Reddragonit.BackBoneDotNet.Attributes;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Org.Reddragonit.BackBoneDotNet
{
    internal static class URLUtility
    {
        //DateTime format yyyymmddHHMMss

        private static Regex _regListPars = new Regex("\\{(\\d+)\\}", RegexOptions.Compiled | RegexOptions.ECMAScript);
        private static readonly DateTime _UTC = new DateTime(1970, 1, 1, 00, 00, 00);

        internal static string GenerateRegexForURL(ModelListMethod mlm, MethodInfo mi)
        {
            string ret = "^(GET\t";
            if (mlm.Host == "*")
                ret += ".+";
            else
                ret+=mlm.Host;
            if (mi.GetParameters().Length > 0)
            {
                ParameterInfo[] pars = mi.GetParameters();
                string[] regexs = new string[pars.Length];
                for (int x = 0; x < pars.Length; x++)
                    regexs[x] = _GetRegexStringForParameter(pars[x]);
                string path = string.Format(mlm.Path, regexs);
                ret += (path.StartsWith("/") ? path : "/" + path).TrimEnd('/');
            }
            else
                ret += (mlm.Path.StartsWith("/") ? mlm.Path : "/" + mlm.Path).TrimEnd('/');
            return ret+")$";
        }

        private static string _GetRegexStringForParameter(ParameterInfo parameterInfo)
        {
            string ret = ".+";
            if (parameterInfo.ParameterType == typeof(DateTime))
                ret = "(\\d+)";
            else if (parameterInfo.ParameterType == typeof(int) ||
                parameterInfo.ParameterType == typeof(long) ||
                parameterInfo.ParameterType == typeof(short) ||
                parameterInfo.ParameterType == typeof(byte))
                ret = "(-?\\d+)";
            else if (parameterInfo.ParameterType == typeof(uint) ||
                parameterInfo.ParameterType == typeof(ulong) ||
                parameterInfo.ParameterType == typeof(ushort))
                ret = "(-?\\d+)";
            else if (parameterInfo.ParameterType == typeof(double) ||
                parameterInfo.ParameterType == typeof(decimal) ||
                parameterInfo.ParameterType == typeof(float))
                ret = "(-?\\d+(.\\d+)?)";
            else if (parameterInfo.ParameterType == typeof(bool))
                ret = "(true|false)";
            return ret;
        }

        internal static object[] ExtractParametersForUrl(MethodInfo mi, string url, string path)
        {
            object[] ret = new object[0];
            ParameterInfo[] pars = mi.GetParameters();
            if (pars.Length > 0)
            {
                List<string> spars = new List<string>();
                List<int> indexes = new List<int>();
                ret = new object[pars.Length];
                while (path.Contains("{"))
                {
                    if (path[0] == '{')
                    {
                        indexes.Add(int.Parse(path.Substring(1, path.IndexOf('}')-1)));
                        path = path.Substring(path.IndexOf('}') + 1);
                        if (path.Contains("{"))
                        {
                            spars.Add(url.Substring(0, url.IndexOf(path.Substring(0, path.IndexOf("{")))));
                            url = url.Substring(0, url.IndexOf(path.Substring(0, path.IndexOf("{"))));
                        }
                        else if (path == "")
                        {
                            spars.Add(url);
                            url = "";
                        }
                        else
                        {
                            spars.Add(url.Substring(0, url.IndexOf(path)));
                            url = url.Substring(0, url.IndexOf(path));
                        }
                    }
                    else
                    {
                        path = path.Substring(1);
                        url = url.Substring(1);
                    }
                }
                for(int x=0;x<indexes.Count;x++){
                    ret[indexes[x]] = _ConvertParameterValue(spars[x],pars[x].ParameterType);
                }
            }
            return ret;
        }

        private static object _ConvertParameterValue(string p, Type type)
        {
            if (type == typeof(DateTime))
                return _UTC.AddMilliseconds(long.Parse(p));
            else if (type == typeof(int))
                return int.Parse(p);
            else if (type == typeof(long))
                return long.Parse(p);
            else if (type == typeof(short))
                return short.Parse(p);
            else if (type == typeof(byte))
                return byte.Parse(p);
            else if (type == typeof(uint))
                return uint.Parse(p);
            else if (type == typeof(ulong))
                return ulong.Parse(p);
            else if (type == typeof(ushort))
                return ushort.Parse(p);
            else if (type == typeof(double))
                return double.Parse(p);
            else if (type == typeof(decimal))
                return decimal.Parse(p);
            else if (type == typeof(float))
                return float.Parse(p);
            else if (type == typeof(bool))
                return bool.Parse(p);
            else
                return p;
        }

        internal static string CreateJavacriptUrlCode(ModelListMethod mlm,MethodInfo mi, Type modelType)
        {
            ParameterInfo[] pars = mi.GetParameters();
            if (pars.Length > 0)
            {
                string[] pNames = new string[pars.Length];
                StringBuilder sb = new StringBuilder();
                for (int x = 0; x < pars.Length; x++)
                {
                    if (pars[x].ParameterType == typeof(bool))
                        sb.AppendLine(pars[x].Name + " = (" + pars[x].Name + " ? 'true' : 'false');");
                    else if (pars[x].ParameterType == typeof(DateTime)){
                        sb.AppendLine("if (!(" + pars[x].Name + " instanceof Date)){");
                        sb.AppendLine("\t" + pars[x].Name + " = new Date(" + pars[x].Name + ");");
                        sb.AppendLine("}");
                        sb.AppendLine(pars[x].Name + " = " + pars[x].Name + ".UTC();");
                    }
                    pNames[x] = "'+"+pars[x].Name+"+'";
                }
                sb.AppendLine("var url='" + string.Format((mlm.Path.StartsWith("/") ? mlm.Path : "/" + mlm.Path).TrimEnd('/'), pNames) + "';");
                return sb.ToString();
            }
            else
                return "var url='" + (mlm.Path.StartsWith("/") ? mlm.Path : "/" + mlm.Path).TrimEnd('/') + "';";
        }

    }
}