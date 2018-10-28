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

		[HttpPost(Name = "HitNext")]
		public async Task<ActionResult> HitNext() {
			return null;
		}
    }
}
