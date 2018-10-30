using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace stuffonharoldnet.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
    public class EventController
    {

		[HttpPost(Name = "SwipedLeft")]
		public async Task<ActionResult> SwipedLeft() {
			return null;
		}

		[HttpPost(Name = "SwipedRight")]
		public async Task<ActionResult> SwipedRight() {
			return null;
		}

        //I hate this word ugh
		[HttpPost(Name = "Shook")]
		public async Task<ActionResult> Shook() {
			return null;
		}
    }
}
