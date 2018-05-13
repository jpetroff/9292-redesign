<style lang="less">

</style>

<template>
	<div class="popup-input__wrapper">
		<div class="popup-input__field">{{label}}</div>
		<div class="popup-modal__wrapper">
			
			<div class="popup-modal__header">
				<div class="popup-modal__close-button"></div>
				<div class="popup-modal__field">
					<span class="popup-modal__label">{{label}}</span>
					<input type="text" class="popup-modal__input">
				</div>
				<div class="popup-modal__close-button"></div>
			</div>
			
			<div class="popup-modal__list">
				<div class="popup_modal__list-helper">{{listHelper}}</div>
				<div v-for="item in suggests">
					<slot name="item" :item="item"></slot>
				</div>
			</div>
			<slot name="progress-steps"></slot>
		</div>
	</div>
</template>

<script>
w.Components['popup-input'] = {
	template: "<%= template %>",
	props:[
		'label',
		'suggests',
		'popup-state',
		'list-helper'
	]
}
</script>