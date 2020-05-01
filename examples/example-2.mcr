





macroScript HAG_CamMngr
		category:     "HAG tools"
		ButtonText:   "Camera manager"
		tooltip:      "Manage Cameras and render batch views"
		silentErrors: false
		icon:         #("extratools", 1)
(

	rollout roll_cambatch "Camera Manager" width:250
	(
		local roll_w = roll_cambatch.width

		group "Active Camera"
		(
			label lbl_cam "" align:#left height:25 offset:[0,5]
		)
		group "Scene cameras"
		(
			listbox lst_1 "" height:8
			button btn_2 "<<" width:60 align:#left across:3
			button btn_s "Select" width:80 align:#center
			button btn_4 ">>" width:60 align:#right
		)
		button btn_1 "Refresh" height:25 width:(roll_w - 25)

		group "Output size"
		(
			spinner spn_1 "Width" type:#integer range:[1,1000000,100] fieldwidth:65 align:#right across:2
			spinner spn_3 "Ratio" type:#float range:[0.0,6.0,1.33] fieldwidth:65 align:#right
			spinner spn_2 "Height" type:#integer range:[1,1000000,100] fieldwidth:65 align:#right across:2
			checkButton chk_ratio "LOCK" height:18 width:75 align:#right
			label lbl_presets "Presets" align:#left
			button p1 "0.63" across:6
			button p2 "0.75"
			button p3 "1.00"
			button p4 "1.33"
			button p5 "1.60"
			button p6 "2.00"
		)

		group "Batch views"
		(
			listbox lst_2 "Batch Views" height:5

			edittext txt_1 "View name" fieldWidth:(roll_w - 25) bold:true labelOnTop:true
			edittext txt_3 "File name" fieldWidth:(roll_w - 25) labelOnTop:true
			edittext txt_2 "Output" fieldWidth:(roll_w - 60) labelOnTop:true across:2
			button btn_p "..." align:#right offset:[0,15] tooltip:"Change path"
			checkbox chk_1 "Override resolution in view" align:#left \
			tooltip:"Set active render output size as view override"
			button btn_v "Add View to batch" width:(roll_w - 70) height:25 align:#left
		)

		button btn_bup "Refresh" width:(roll_w - 70) height:25 align:#left
		button btn_b "Open Batch window" width:(roll_w - 70) height:25 align:#left

		local active_cam
		local list_cam
		local curr_itm = 1
		local batch_view
		local view_name = ""
		local view_path = undefined


		fn get_output_values =
		(
			spn_1.value = renderWidth
			spn_2.value = renderHeight
			spn_3.value = rendImageAspectRatio
		)

		fn set_output_res_ratio val =
		(
			rendImageAspectRatio = val

			spn_1.value = renderWidth
			spn_2.value = renderHeight

			if renderSceneDialog.isOpen() then renderSceneDialog.update()
		)
		fn set_output_res w h =
		(
			if w != undefined then renderWidth = w
			if h != undefined then renderHeight = h
			spn_3.value = rendImageAspectRatio
			if renderSceneDialog.isOpen() then renderSceneDialog.update()
		)

		fn selCam n =
		(
			max modify mode
			if isValidNode n then select n
		)

		fn listCameras =
		(
			for i=1 to cameras.count collect (
				local cam = cameras[i]
				#(cam, cam.name)
			)
		)
		fn relist_cams =
		(
			list_cam = listCameras()
			local only_names = for i in list_cam where (isKindOf i[1] camera) collect i[2]
			local only_cams = for i in list_cam where (isKindOf i[1] camera) collect i[1]
			lst_1.items = only_names
		)

		fn change_active =
		(
			active_cam = getActiveCamera()
			lbl_cam.text = if active_cam != undefined then active_cam.name else "None"
			RedrawViews()
		)

		fn setActiveCam n =
		(
			if n != undefined then (
				local cam = if (isKindOf n string) then ( getNodeByName n) else n
				if isValidNode cam and (isKindOf cam camera) then viewport.SetCamera cam
				change_active()
			)
		)

		fn update_Path cam: =
		(
			if view_path != undefined then (
				txt_2.text = getFilenamePath view_path
				txt_3.text = filenameFromPath view_path
			)
		)
		fn findItemInList item lst =
		(
			local idx = FindItem lst.Items item
			if idx != 0 then lst.selection = idx
		)

		fn view_settings =
		(

			local temp_cam = active_cam
			if (temp_cam != undefined) then (
				txt_1.text = temp_cam.name + "-" + (rendImageAspectRatio as string)

				if (view_path != undefined) then (

					local root = getFilenamePath view_path
					local type = getFilenameType view_path
					local filename = filenameFromPath view_path

					local comp_filename = temp_cam.name + type

					for i in list_cam do (
						local n = i[2]
						local f = matchPattern filename pattern:("*"+n+"*")
						if f then (
							local filename_parse = findString filename n
							comp_filename = replace filename filename_parse (n.count) temp_cam.name
							exit
						)
					)

					view_path = pathConfig.appendPath root comp_filename
					update_Path()
				)
			)
		)

		fn list_views =
		(
			local gv = batchRenderMgr.GetView
			local num = batchRenderMgr.numViews
			local col = for i=1 to num collect (
				local the_view = gv i
				local st = if the_view.enabled then "[x] " else "[o] "
				st+the_view.name
			)
			lst_2.items = col
		)

		fn view_add =
		(

			local temp_cam = active_cam
			if temp_cam != undefined then (
				if (batchRenderMgr.FindView txt_1.text) == 0 then (
					local new_view = batchRenderMgr.CreateView temp_cam
					if (new_view.overridePreset = chk_1.state) then (
						new_view.width = renderWidth
						new_view.height = renderHeight
					)
					new_view.name = txt_1.text
					new_view.outputFilename = view_path

					list_views()

				) else messageBox "View Already exist.\nChange name and try again."
			)
		)

		fn get_view_params index =
		(
			local the_view = try (batchRenderMgr.GetView index) catch undefined
			if the_view != undefined then (
				local cam = the_view.camera
				if isValidNode cam then (
					setActiveCam cam

					findItemInList cam.name lst_1
					view_settings()
				)

				if the_view.overridePreset then (
					renderWidth = the_view.width
					renderHeight = the_view.height
					get_output_values()
				)
				CompleteRedraw()
			)
		)

		on roll_cambatch open do
		(
			change_active()
			relist_cams()
			view_settings()

			get_output_values()
			list_views()
		)

		on btn_s pressed do ( selCam active_cam )

		on btn_2 pressed do
		(
			if curr_itm > 1 then curr_itm -=1
			lst_1.selection = curr_itm
			setActiveCam lst_1.selected
			view_settings()
		)

		on btn_4 pressed do
		(
			if curr_itm < lst_1.items.count then curr_itm +=1
			lst_1.selection = curr_itm
			setActiveCam lst_1.selected
			view_settings()
		)

		on lst_1 selected item do
		(
			curr_itm = item
			setActiveCam lst_1.selected
			view_settings()
		)

		on btn_1 pressed do  (
			change_active()
			relist_cams()
		)

		on spn_1 changed val do (
			if chk_ratio.checked then spn_2.value = floor(val/spn_3.value)
			set_output_res val undefined
		)
		on spn_2 changed val do (
			set_output_res undefined val
			if chk_ratio.checked then  spn_1.value = floor(val*spn_3.value)
		)
		on spn_3 changed val do (
			set_output_res_ratio val
		)

		on p1 pressed do (
			spn_3.value = execute p1.text
			set_output_res_ratio (spn_3.value)
		)
		on p2 pressed do (
			spn_3.value = execute p2.text
			set_output_res_ratio (spn_3.value)
		)
		on p3 pressed do (
			spn_3.value = execute p3.text
			set_output_res_ratio (spn_3.value)
		)
		on p4 pressed do (
			spn_3.value = execute p4.text
			set_output_res_ratio (spn_3.value)
		)
		on p5 pressed do (
			spn_3.value = execute p5.text
			set_output_res_ratio (spn_3.value)
		)
		on p6 pressed do (
			spn_3.value = execute p6.text
			set_output_res_ratio (spn_3.value)
		)

		on lst_2 selected item do (
			get_view_params item
		)

		on btn_p pressed do
		(
			view_path = getBitmapSaveFileName()
			update_Path()
		)

		on btn_bup pressed do (
			list_views()
		)

		on btn_b pressed do (actionMan.executeAction -43434444 "4096")

		on btn_v pressed do
		(
			view_settings()
			view_add()
		)
	)

	on execute do (
		try (DestroyDialog roll_cambatch)catch()
		CreateDialog roll_cambatch 250 -1 100 200
	)
)