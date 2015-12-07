// SimpleSchema.debug = true;
// AutoForm.debug()

// AutoForm.addHooks(null, {
// 	onError: function (name, error, template) {
// 		console.log(name + " error:", error);
// 	}
// });

Products.insert({_id: '1', description: 'Thing your project will make', minimumCount: 100});

Fixies.insert({_id: '1', product_id: '1', description: 'Upfront cost that is the same no matter how many you make', cost: 500});

Scalies.insert({_id: '1', product_id: '1', description: 'Cost that scales with the number created', minimumCost: 1000});

Peries.insert({_id: '1', product_id: '1', description: 'Cost that you spend on every single thing you make', cost: 5});


Pads.insert({description: 'Cushion', percentage: 5});
Cuts.insert({description: 'Kickstarter and Card Fees', percentage: 10});


Template.registerHelper('products', function () {
	return Products.find({});
});

Template.registerHelper('uniqueId', function () {
	return Random.id();
});

var existsFunc = function (value) {
	return (value != undefined) && (value != null) && (isFinite(value));
};


var getProductFixedTotal = function (productId) {
	return _.reduce(Fixies.find({product_id: productId}).fetch(), function (memo, doc) {return doc.cost + memo;}, 0);	
};

var getProductPerItemTotal = function (productId) {
	return _.reduce(Peries.find({product_id: productId}).fetch(), function (memo, doc) {return doc.cost + memo;}, 0);
};

var getProductScalingTotal = function (productId) {
	if (Products.findOne(productId).minimumCount)
		return _.reduce(Scalies.find({product_id: productId}).fetch(), function (memo, doc) {return doc.minimumCost + memo;}, 0);
	else
		return 0;
};

var getProductRatio = function (productId) {
	var perItemCosts = getProductPerItemTotal(productId);
	var decidedCharge = Products.findOne(productId).decidedCharge;

	if (!existsFunc(decidedCharge)) throw "Nonexistent decidedCharge";

	return perItemCosts / (decidedCharge - perItemCosts);
};

Session.setDefault('invalidDecidedChargeObject', {});
Session.setDefault('invalidDecidedCharge', false);
Template.product.created = function () {
	this._minimumCharge = new ReactiveVar(null);
};
Template.product.helpers({
	fixies: function () {
		return Fixies.find({product_id: this._id});
	},
	scalies: function () {
		return Scalies.find({product_id: this._id});
	},
	peries: function () {
		return Peries.find({product_id: this._id});
	},
	minimumCharge: function () {
		var productId = this._id;

		var perItemCosts = getProductPerItemTotal(productId);
		var count = this.minimumCount;

		if (!existsFunc(count)) return 1 + perItemCosts;
		if (count == 0) throw "Zero minimumCount";

		var fixedCosts = getProductFixedTotal(productId);
		var scalingCosts = getProductScalingTotal(productId);

		var give = ((fixedCosts + scalingCosts) / count) + perItemCosts;
		Template.instance()._minimumCharge.set(give);
		return give;
	},
	decidedChargeInvalid: function () {
		var invalid = Template.instance()._minimumCharge.get() > this.decidedCharge;

		var validityObject = Session.get('invalidDecidedChargeObject');
		validityObject[this._id] = invalid;
		Session.set('invalidDecidedChargeObject', validityObject);

		Session.set('invalidDecidedCharge', _.some(_.values(validityObject)));

		return invalid;
	}
});
Template.minimumCountBox.events({
	'click .delete-minimum-count': function (e, t) {
		var id = $(e.target).attr('data-id');
		Products.update(id, {$unset: {minimumCount: ''}})
	}
})

Template.decidedChargeBox.helpers({
	decidedChargeBoxForm: function () {
		return "decidedChargeBoxForm" + this._id;
	}
});


var getProjectFixedTotal = function (projectId) {
	// var project = Projects.findOne(projectId);
	// var products = Products.find({project_id: project._id});

	var products = Products.find();
	var total = 0;
	products.forEach(function (product) {
		total += getProductFixedTotal(product._id);
	});

	return total;
};

var getProjectScalingTotal = function (projectId) {
	// var project = Projects.findOne(projectId);
	// var products = Products.find({project_id: project._id});

	var products = Products.find();
	var total = 0;
	products.forEach(function (product) {
		total += getProductScalingTotal(product._id);
	});

	return total;	
};

var getProjectRatio = function (projectId) {
	// var project = Projects.findOne(projectId);
	// var products = Products.find({project_id: project._id});

	var products = Products.find();
	var ratios = [];
	products.forEach(function (product) {
		ratios.push(getProductRatio(product._id));
	});

	console.log(ratios)
	console.log(!ratios)

	if (!ratios) throw "No ratios";
	return _.max(ratios);
};

Session.setDefault('invalidCuts', false);
Template.goal.created = function () {
	var goalCompFunc = function (oldVal, newVal) {
		if (!existsFunc(oldVal) && !existsFunc(newVal)) return true;
		else return oldVal == newVal;
	};
	this._baselineGoal = new ReactiveVar(null, goalCompFunc);
	this._paddedGoal = new ReactiveVar(null, goalCompFunc);
};
Template.goal.helpers({
	pads: function () {
		// return Pads.find({project_id: projectId})
		return Pads.find();
	},
	cuts: function () {
		// return Cuts.find({project_id: projectId})
		return Cuts.find();
	},
	baselineGoal: function () {
		console.log('baseline')

		var projectId = null;
		// var projectId = this.projectId;
		try {
			var ratio = getProjectRatio(projectId);
			console.log('ratio' + ratio)
		}
		catch (error) {
			console.log('error')
			return null;
		}

		var fixedCosts = getProjectFixedTotal(projectId);
		var scalingCosts = getProjectScalingTotal(projectId);

		Template.instance()._baselineGoal.set((fixedCosts + scalingCosts) * (1 + ratio));
		console.log(Math.ceil(Template.instance()._baselineGoal.get()))
		return Math.ceil(Template.instance()._baselineGoal.get());
	},
	paddedGoal: function () {
		var base = Template.instance()._baselineGoal.get();

		// return Pads.find({project_id: projectId})
		var pads = Pads.find()
		var totalPad = 0;
		pads.forEach(function (pad) {
			totalPad += pad.percentage;
		});
		totalPad = totalPad / 100;

		var give = base * (1 + totalPad);
		Template.instance()._paddedGoal.set(give);
		return Math.ceil(give);
	},
	finalGoal: function () {
		var padded = Template.instance()._paddedGoal.get();

		// return Cuts.find({project_id: projectId})
		var cuts = Cuts.find();
		var totalCut = 0;
		cuts.forEach(function (cut) {
			totalCut += cut.percentage;
		});
		totalCut = totalCut / 100;

		if (totalCut >= 1) {
			Session.set('invalidCuts', true);
			return null;
		}
		else Session.set('invalidCuts', false);

		give = padded / (1 - totalCut);
		return Math.ceil(give);
	}
});


Template.scalieBox.helpers({
	insertPriceBreakId: function () {
		return "insertPriceBreak" + this._id;
	},
	priceBreakFormId: function () {
		return "pricebreakForm" + this._id;
	},
	pricebreaks: function () {
		return Pricebreaks.find({scalie_id: this._id});
	}
});