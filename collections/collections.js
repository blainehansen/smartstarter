Schema = {};

Projects = new Meteor.Collection('projects');
Schema.Projects = new SimpleSchema({
	description: {
		type: String,
		label: "Description",
		trim: true
	}
});
Projects.attachSchema(Schema.Projects);

Pads = new Meteor.Collection('pads');
Schema.Pads = new SimpleSchema({
	description: {
		type: String,
		label: "Description",
		trim: true
	},
	percentage: {
		type: Number,
		label: "Percentage",
		decimal: true,
		min: 0,
		exclusiveMin: true,
	},
	// project_id: {
	// 	type: String,
	// 	autoform: {
	// 		omit: true
	// 	}
	// }
});
Pads.attachSchema(Schema.Pads);

Cuts = new Meteor.Collection('cuts');
Schema.Cuts = new SimpleSchema({
	description: {
		type: String,
		label: "Description",
		trim: true
	},
	percentage: {
		type: Number,
		label: "Percentage",
		decimal: true,
		min: 0,
		max: 100,
		exclusiveMin: true,
		exclusiveMax: true
	},
	// project_id: {
	// 	type: String,
	// 	autoform: {
	// 		omit: true
	// 	}
	// }
});
Cuts.attachSchema(Schema.Cuts);

Products = new Meteor.Collection('products');
Schema.Products = new SimpleSchema({
	description: {
		type: String,
		label: "Description",
		trim: true
	},
	minimumCount: {
		type: Number,
		label: "Minimum Count",
		min: 1,
		optional: true
	},
	decidedCharge: {
		type: Number,
		label: "Decided Charge",
		min: 0,
		exclusiveMin: true,
		decimal: true,
		optional: true
	},
	// project_id: {
	// 	type: String,
	// 	autoform: {
	// 		omit: true
	// 	}
	// }
});
Products.attachSchema(Schema.Products);


Fixies = new Meteor.Collection('fixies');
Schema.Fixies = new SimpleSchema({
	description: {
		type: String,
		label: "Description",
		trim: true,
		optional: true
	},
	cost: {
		type: Number,
		label: "Cost",
		min: 0,
		exclusiveMin: true,
		decimal: true
	},
	product_id: {
		type: String,
		autoform: {
			omit: true
		}
	}
});
Fixies.attachSchema(Schema.Fixies);

Scalies = new Meteor.Collection('scalies');
Schema.Scalies = new SimpleSchema({
	description: {
		type: String,
		label: "Description",
		trim: true,
		optional: true
	},
	minimumCost: {
		type: Number,
		label: "Minimum Cost",
		min: 0,
		exclusiveMin: true,
		decimal: true
	},
	product_id: {
		type: String,
		autoform: {
			omit: true
		}
	}
});
Scalies.attachSchema(Schema.Scalies);

Pricebreaks = new Meteor.Collection('pricebreaks');
Schema.Pricebreaks = new SimpleSchema({
	cost: {
		type: Number,
		label: "Cost",
		min: 0,
		exclusiveMin: true,
		decimal: true
	},
	count: {
		type: Number,
		label: "Count",
		min: 1
	},
	scalie_id: {
		type: String,
		autoform: {
			omit: true
		}
	}
});
Pricebreaks.attachSchema(Schema.Pricebreaks);

Peries = new Meteor.Collection('peries');
Peries.attachSchema(Schema.Fixies);