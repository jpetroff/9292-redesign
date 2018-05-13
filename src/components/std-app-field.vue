<style lang="less">
	.std-app-field {
	
	}
</style>

<template>
	<div class="std-app-field">
		<label v-if="(type != 'datetime')" class="std-app-field__label">
			<span class="active-label">{{label}}</span>
		</label>
		
		<div v-if="editable && (type != 'datetime')" type="text" class="std-app-field__input editable">
			<input type="text" class="internal-input"
				   :placeholder="placeholder"
				   :value="value"
				   @input="updateValue($event.target.value)"
				   :id="focusid"
			>
		</div>
		
		<label v-if="!editable && (type != 'datetime')" :for="focusto" @click="emitClick" class="std-app-field__input">
			{{value}}
			<span class="input-append" v-if="append">{{append}}</span>
		</label>
		
		<label :for="focusid" v-if="(type == 'datetime')" class="std-app-field__input editable">
			{{window.utils.printDateTime(value)}}
			<input
				type="datetime-local"
				class="std-app-field__datetime-hidden"
				:id="focusid"
				
				@input="updateValue($event.target.value)"
			/>
		</label>
		
	</div>
</template>

<script type="text/javascript">
w.Components['std-app-field'] = {
	template: '<%= template %>',
	props: ['label','value','placeholder','editable','append', 'type','focusto','focusid'],
	data: function() {
		return { labelDatetimeId: (Math.random().toString(36).substring(7)) };
	},
	methods: {
		updateValue: function(value) {
			this.$emit('input', value.trim());
		},
		emitClick: function() {
			this.$emit('click');
		}
	}
}
</script>