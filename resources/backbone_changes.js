(function () {
    Backbone = _.extend(Backbone, {
        ErrorMessages: {},
        Language: 'en',
        TranslateValidationError: function (errorMessage) {
            var props = ((Backbone.Language) + '.' + errorMessage).split('.');
            var obj = Backbone.ErrorMessages;
            var ret = errorMessage;
            for (var x = 0; x < props.length; x++) {
                if (obj[props[x]] != undefined) {
                    obj = obj[props[x]];
                } else {
                    obj = null;
                    x = props.length;
                }
            }
            if (obj != null) {
                ret = obj;
            }
            return ret;
        },
        ShowModelError: function (model) {
            var erDialog = $('#Backbone_Error_Dialog');
            if (erDialog.length == 0) {
                erDialog = $('<div id="Backbone_Error_Dialog" class="dialog error"></div>');
                $(document.body).append(erDialog);
            }
            erDialog.html('');
            var ul = $('<ul></ul>');
            erDialog.append(ul);
            for (var x = 0; x < model.errors.length; x++) {
                ul.append('<li class="' + model.errors[x].field + '"><span class="error_field_name">' + model.errors[x].field + '</span><span class="error_field_message">' + model.errors[x].error + '</span></li>');
            }
            erDialog.show();
        },
        DefineErrorMessage: function (language, path, message) {
            if (language == undefined) { throw 'You must supply a language'; }
            if (path == undefined) { throw 'You must supply an exception path'; }
            if (message == undefined) { throw 'You must supply a message'; }
            var props = path.split('.');
            Backbone.ErrorMessages[language] = Backbone.ErrorMessages[language] || {};
            var obj = Backbone.ErrorMessages[language];
            for (var x = 0; x < props.length-1; x++) {
                obj[props[x]] = obj[props[x]] || {};
                obj = obj[props[x]];
            }
            if (typeof message == 'string' || message instanceof String) {
                obj[props[props.length - 1]] = message;
            } else {
                obj[props[props.length - 1]] = _.extend(true, obj[props[props.length - 1]] || {}, message);
            }
        }
    });

    Backbone.Model.prototype.isModel = function () { return true;}

    Backbone.Model.prototype.get = function (attr) {
        if (this.LazyLoadAttributes != undefined) {
            for (var x = 0; x < this.LazyLoadAttributes.length; x++) {
                if (this.LazyLoadAttributes[x] == attr) {
                    if (this.attributes[attr] != null) {
                        if (this.attributes[attr] instanceof Backbone.Collection) {
                            if (this.attributes[attr].length > 0) {
                                if (!(this.attributes[attr].at(0).isLoaded == undefined ? false : this.attributes[attr].at(0).isLoaded) && _.keys(this.attributes[attr].at(0).attributes).length == 1) {
                                    for (var x = 0; x < this.attributes[attr].length; x++) {
                                        this.attributes[attr].at(x).fetch({ async: false });
                                        this.attributes[attr].at(x).isLoaded = true;
                                        this.attributes[attr].at(x)._previousAttributes = this.attributes[attr].at(x).attributes;
                                    }
                                }
                            }
                        } else if (this.attributes[attr] instanceof Array) {
                            if (this.attributes[attr].length > 0) {
                                if (!(this.attributes[attr][0].isLoaded == undefined ? false : this.attributes[attr][0].isLoaded) && _.keys(this.attributes[attr][0].attributes).length == 1) {
                                    for (var x = 0; x < this.attributes[attr].length; x++) {
                                        this.attributes[attr][x].fetch({ async: false });
                                        this.attributes[attr][x].isLoaded = true;
                                        this.attributes[attr][x]._previousAttributes = this.attributes[attr][x].attributes;
                                    }
                                }
                            }
                        } else {
                            if (!(this.attributes[attr].isLoaded == undefined ? false : this.attributes[attr].isLoaded) && _.keys(this.attributes[attr].attributes).length == 1) {
                                this.attributes[attr].fetch({ async: false });
                                this.attributes[attr].isLoaded = true;
                                this.attributes[attr]._previousAttributes = this.attributes[attr].attributes;
                            }
                        }
                        this._previousAttributes[attr] = this.attributes[attr];
                    }
                    x = this.LazyLoadAttributes.length;
                }
            }
        }
        return this.attributes[attr];
    };
    eval('Backbone.Model.prototype._fetch = '+Backbone.Model.prototype.fetch.toString());
    Backbone.Model.prototype.fetch = function (options) {
        options = options ? _.clone(options) : {};
        if (options.parse === void 0) options.parse = true;
        options.reset = true;
        return this._fetch(options);
    },
    eval('Backbone.Model.prototype._set = ' + Backbone.Model.prototype.set.toString());
    Backbone.Model.prototype.set = function (key, val, options) {
        if (key == null) return this;

        // Handle both `"key", value` and `{key: value}` -style arguments.
        if (typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }
        options || (options = {});
        if (!(options.reset==undefined ? false : options.reset)) {
            this._changedFields = (this._changedFields == undefined ? [] : this._changedFields);
            for (var k in attrs) {
                if (!_.isEqual((this.attributes[k] == undefined ? null : (this.attributes[k].isModel != undefined && this.attributes[k].isModel() ? this.attributes[k].id : this.attributes[k])), (this.attributes[k] == undefined ? attrs[k] : (this.attributes[k].isModel != undefined && this.attributes[k].isModel() ? attrs[k].id : attrs[k]))) && this._changedFields.indexOf(k) < 0) {
                    this._changedFields.push(k);
                }
            }
        }
        return this._set(attrs, options);
    };
    Backbone.Model.prototype.toJSON = function () {
        var attrs = {};
        this._changedFields = (this._changedFields == undefined ? [] : this._changedFields);
        for (var k in this.attributes) {
            if (this._changedFields.indexOf(k) >= 0 || this.isNew()) {
                attrs[k] = this.attributes[k];
            }
        }
        return attrs;
    };
    //added in sync Save function to specify synchronous communication
    Backbone.Model.prototype.syncSave = function (attrs, options) {
        if (!options) { options = {}; }
        options = _.extend(options, { async: false });
        return this.save(attrs, options);
    };
    //added in sync destroy function to specify synchronous communication
    Backbone.Model.prototype.syncDestroy = function (options) {
        if (!options) { options = {}; }
        options = _.extend(options, { async: false });
        return this.destroy(options);
    };
    Backbone.Model.prototype.destroy = function (options) {
        options = options ? _.clone(options) : {};
        var model = this;
        var success = options.success;

        var destroy = function () {
            model.trigger('destroy', model, model.collection, options);
        };

        options.success = function (resp) {
            if (resp) {
                if (options.wait || model.isNew()) destroy();
                if (success) success(model, resp, options);
                if (!model.isNew()) model.trigger('sync', model, resp, options);
            } else if (options.error) {
                options.error(model, response, options);
            }
        };

        if (this.isNew()) {
            options.success();
            return false;
        }
        if (this.wrapError == undefined) {
            this.wrapError = function (model, options) {
                var error = options.error;
                options.error = function (resp) {
                    if (error) error(model, resp, options);
                    model.trigger('error', model, resp, options);
                };
            };
        }
        this.wrapError(this, options);

        var xhr = this.sync('delete', this, options);
        if (!options.wait) destroy();
        return xhr;
    };
    eval('var wrapError = function (model, options) { \
        var error = options.error; \
        options.error = function (resp) { \
            if (error) error(model, resp, options); \
            model.trigger(\'error\', model, resp, options); \
        }; \
    };\
    Backbone.Model.prototype._origSave = ' + Backbone.Model.prototype.save.toString());
    eval('var wrapError = function (model, options) { \
        var error = options.error; \
        options.error = function (resp) { \
            if (error) error(model, resp, options); \
            model.trigger(\'error\', model, resp, options); \
        }; \
    };\
    Backbone.Model.prototype._destroy = ' + Backbone.Model.prototype.destroy.toString());
    Backbone.Model.prototype._save = function (key, val, options) {
        Backbone.Model.prototype._baseSave(key, val, options);
    };
    Backbone.Model.prototype._baseSave = function (key, val, options) {
        if (key == null || typeof key === 'object') {
            attrs = key;
            options = val;
        } else {
            (attrs = {})[key] = val;
        }
        options = _.extend({ validate: true }, options);
        this._changedFields = (this._changedFields == undefined ? [] : this._changedFields);
        for (var k in attrs) {
            if (!_.isEqual(this.attributes[k], attrs[k]) && this._changedFields.indexOf(k) < 0) {
                this._changedFields.push(k);
            }
        }
        var newOptions = _.extend(_.clone(options), {
            originalOptions: options,
            originalSuccess: options.success,
            originalError:options.error,
            success: function (model, response, options) {
                model._changedFields = [];
                if (options.originalSuccess != undefined) {
                    options.originalSuccess(model, response, options.originalOptions);
                }
            },
            error: function (model, xhr, options) {
                if (options.originalError != undefined) {
                    options.originalError(model, xhr, options.originalOptions);
                }
            }
        });
        this._origSave(attrs,newOptions);
    };
    Backbone.Model.prototype.save = function (key, val, options) { this._save(key, val, options); };
    Backbone.View.prototype.AdditionalRenderCalls = [];
    Backbone.View.prototype.initialize = function (options) {
        if (this.model != undefined) {
            if (this.model.on != undefined) {
                this.model.on('change', this.render, this);
            }
        } else if (this.collection != undefined) {
            if (this.collection.on != undefined) {
                this.collection.on('reset', this.render, this);
                this.collection.on('sync', this.render, this);
                this.collection.on('sort', this.render, this);
                if (this.AddModel != undefined) {
                    this.collection.on('add',this.AddModel,this);
                }
                if (this.RemoveModel != undefined) {
                    this.collection.on('remove', this.RemoveModel, this);
                }
            }
        }
        _.extend(this, _.omit(options, _.keys(this)));
        for (var x = 0; x < this.AdditionalRenderCalls.length; x++) {
            this.on('pre_render_complete', this.AdditionalRenderCalls[x], this);
        }
    };
    Backbone.Collection.prototype.initialize = function () {
        this.isNew = true;
    };
    eval('var wrapError = function (model, options) { \
        var error = options.error; \
        options.error = function (resp) { \
            if (error) error(model, resp, options); \
            model.trigger(\'error\', model, resp, options); \
        }; \
    };\
    Backbone.Collection.prototype._fetch = ' + Backbone.Collection.prototype.fetch.toString());
    Backbone.Collection.prototype.fetch = function (options) {
        options = (options==undefined || options==null ? {} : _.clone(options));
        options.sort = false;
        if (this.isNew) {
            newOptions = _.extend(_.clone(options), {
                reset: true,
                silent:true,
                originalOptions: options,
                originalSuccess: options.success,
                originalError: options.error,
                success: function (collection, response, options) {
                    collection.isNew = false;
                    if (options.originalSuccess != undefined) {
                        options.originalSuccess(collection, response, options.originalOptions);
                    }
                },
                error: function (collection, xhr, options) {
                    if (options.originalError != undefined) {
                        options.originalError(model, xhr, options.originalOptions);
                    }
                }
            });
            return this._fetch(newOptions);
        } else {
            return this._fetch(options);
        }
    };
    if (Array.isArray==undefined){
        Array.isArray = function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    }
}).call(this);