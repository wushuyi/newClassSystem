define(["dust"], function () { dust = require("dust"); (function(){dust.register("classSessionView",body_0);function body_0(chk,ctx){return chk.section(ctx.get(["quizIdListResults"], false),ctx,{"block":body_1},{});}function body_1(chk,ctx){return chk.write("<li class=\"list session-list\"><span class=\"class-name\">").reference(ctx.get(["knowledgeName"], false),ctx,"h").write("</span><div class=\"class-list\"><ul>").section(ctx.get(["quizIds"], false),ctx,{"block":body_2},{}).write("</ul></div></li>");}function body_2(chk,ctx){return chk.write("<li class=\"quiz\" data-quiz-id=\"").reference(ctx.get(["quizId"], false),ctx,"h").write("\">").reference(ctx.get(["index"], false),ctx,"h").write("</li>");}return body_0;})();});