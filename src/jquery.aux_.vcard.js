(function($){
	if(!('aux' in $)) {
		$.aux = {};
	}

	function parameter(/* name, value */) {
		var self = this;

		var name = '';
		var value = '';

		if(arguments.length == 1)
			self.parse(arguments[0]);
		else if(arguments.length > 1) {
			name = arguments[0];
			value = arguments[1];
		}

		this.parse = function(string) {
			if($.isPlainObject(string)) {
				if(string.hasOwnProperty('name')) name = string.name;
				if(string.hasOwnProperty('value')) value = string.value;
			}
			else {
				var list = string.split('=', 2);
				name = list[0];
				if(list.length > 1)
					value = list[1];
			}
		}

		this.getName = function() {return(name);}
		this.getValue = function() {return(value);}
	}

	function contentLine(/* name, value, params, group */) {
		var self = this;

		var group = null;
		var name = '';
		var params = [];
		var value = '';

		var incoming;

		this.getGroup = function() {return(group);}
		this.getParams = function() {return(params);}
		this.getName = function() {return(name);}
		this.getValue = function() {return(value);}

		// TODO No escaping and no folding yet.
		this.generate = function() {
			var result = '';
			if(group instanceof String && group.length > 0)
				result = group + '.';
			result += name.toUpperCase();
			if($.isArray(params) && params.length > 0)
				result += ';' + params.join(';');
			result += ':' + value;
			return(result);
		}

		// TODO Implement parser.
		this.parse = function(string) { }

		this.setData = function(data) {
			if(data.hasOwnProperty('group')) group = data.group;
			if(data.hasOwnProperty('name')) name = data.name;
			if(data.hasOwnProperty('params')) params = data.params;
			if(data.hasOwnProperty('value')) value = data.value;
			self.processParams();
		}

		this.processParams = function() {
			if(params == null)
				params = [];
			else if(!$.isArray(params))
				params = [params];
			$.map(params, function(item) {
				if(item instanceof parameter)
					return(item);
				else
					return(new parameter(item));
			});
		}

		// We either got vCard string and should parse it or we got object with all data.
		if(arguments.length == 1) {
			incoming = arguments[0];
			if(incoming instanceof String)
				self.parse(incoming);
			else if($.isPlainObject(incoming))
				self.setData(incoming);
		}
		else {
			incoming = {};
			switch(arguments.length) {
				case 4:
					incoming.group = arguments[3];
				case 3:
					incoming.params = arguments[2];
				case 2:
					incoming.value = arguments[1];
					incoming.name = arguments[0];
					self.setData(incoming);
					break;
			}
		}
	}

	// TODO Process data in constructor.
	function vcardInstance(newVersion /* data */) {
		var self = this;

		var version = newVersion;
		var header = 'BEGIN:VCARD';
		var footer = 'END:VCARD';
		var data = [];

		// TODO We might need to throw exception here or return error some way.
		this.setVersion = function(newVersion) {
			if(newVersion == '2.1' || newVersion == '3.0' || newVersion == '4.0')
				version = newVersion;
			return(self);
		}

		this.addLine = function(line) {
			data.push(line);
		}

		this.generate = function() {
			return([header, 'VERSION:' + version].concat(
				$.map(data, function(item) {
					if(!(item instanceof contentLine))
						item = new contentLine(item);
					return(item.generate());
				}),
				[footer, '']).join('\r\n')
			);
		}
	}

	function vcard() {
		var self = this;
		var version = '3.0';

		// TODO We might not need it here.
		this.setVersion = function(newVersion) {
			if(newVersion == '2.1' || newVersion == '3.0' || newVersion == '4.0')
				version = newVersion;
			return(self);
		}

		this.create = function(/* data */) {
			var instance = arguments.length > 0 ? new vcardInstance(version, arguments[0]) : new vcardInstance(version);
			return(instance);
		}

		this.contentLine = contentLine;
	}

	$.aux.vcard = new vcard();

})(jQuery);