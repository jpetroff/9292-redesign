<style lang="less">
	/* text-field.vue */
	.text-field {
		@text-size: 14px;
		@line-height: 20px;
		@top-margin: 8px;
		@left-margin: 16px;
		
		@label-text-focused: ceil(@text-size*0.8);
		@label-lineheight-focused: ceil(@line-height*0.8);
		@input-height: 2*@top-margin+@line-height+@label-lineheight-focused;
		@empty-top-margin: ceil((@input-height - @line-height)/2);
		
		font-size: @text-size;
		overflow: hidden;
		position: relative;
		z-index: 1;
		display: block;
		width: 100%;
		vertical-align: top;
		margin: 0;
		padding: 0;
		/*font-family: "Open Sans", Helvetica;*/
		font-weight: normal;
		font-variant: normal;
		font-style: normal;
		margin-bottom: 32px;
		border: 2px solid #DBDBDB;
		border-radius: 4px;
		box-sizing: border-box;
		transition: border-color 0.2s ease;
		
		&__input {
			display: block;
			position: relative;
			padding: ceil(@top-margin+@label-lineheight-focused) @left-margin @top-margin @left-margin;
			font-size: @text-size;
			line-height: @line-height;
			width: 100%;
			box-sizing: border-box;
			color: #444;
			outline: 0;
			border: none;
		}
		
		&__label {
			position: absolute;
			top: @empty-top-margin;
			left: @left-margin;
			padding: 0;
			width: 100%;
			height: @line-height;
			line-height: @line-height;
			font-size: @text-size;
			text-align: left;
			pointer-events: none;
			color: #999;
			font-family: "Open Sans", Helvetica;
			transition: all 0.3s ease;
		}
		
		&_has-input {
			.text-field__label {
				top: @top-margin;
				line-height: @label-lineheight-focused;
				height: @label-lineheight-focused;
				font-size: @label-text-focused;
			}
		}
		
		&_error {
			border-color: red;
			.text-field__label {
				color: red;
			}
		}
		
	}
	
</style>

<template>
	<div class="text-field"
	:class="{
		'text-field_error': validator.$error,
		'text-field_has-input': focus || value
	}">
		<div class="disabled-overlay"></div>
		<input
			:value="value"
			@input="updateValue($event.target.value)"
			@focus="focus = true"
			@blur="focus = false"
			type="text"
			class="text-field__input"
			id="text-field-field__destination"
			name="destination"
		>
		<label class="text-field__label" for="text-field-field__destination">{{message}}</label>
	</div>
</template>

<script type="text/javascript">
w.Components['text-field'] = {
	template: '<%=template%>',
	props: [
		'label',
		'label-error',
		'value',
		'validator'
	],
	created: function() {
		this.triggerError = _.debounce(_.bind(this.validator.$touch, this), 500)
	},
	data: function() {
		return {
			focus: false
		}
	},
	computed: {
		message: function() {
			if (this.validator.$error) {
				return this.labelError
			} else {
				return this.label
			}
		}
	},
	methods: {
		updateValue: function(value) {
			this.validator.$reset()
			this.$emit('input', value)
			this.triggerError()
		}
	}
}
</script>