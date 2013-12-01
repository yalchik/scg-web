GwfFileLoader = {

    load: function (args) {


        var reader = new FileReader();
        var is_file_correct;
        reader.onload = function (e) {
            is_file_correct = GwfObjectInfoReader.read(e.target.result);

        }

        reader.onloadend = function (e) {
            if (is_file_correct != false) {
                ScgObjectBuilder.buildObjects(GwfObjectInfoReader.objects_info);
                args["render"].update();
            } else
                GwfObjectInfoReader.printErrors();

        }
        reader.readAsText(args["file"]);

        return true;
    }
}