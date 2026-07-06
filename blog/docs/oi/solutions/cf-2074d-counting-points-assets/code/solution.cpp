#include <bits/stdc++.h>
#include <algorithm>
#include <ranges>
using namespace std;
struct info {
    int l, r, o;
    int d;
    auto operator<=>(const info &rhs) const { return l <=> rhs.l; }
    auto operator==(const info &rhs) const { return l == rhs.l; }
};
void solve() {
    int n, m;
    cin >> n >> m;
    vector<int> x(n);
    for (auto &i : x) {
        cin >> i;
    }
    vector<int> r(n);
    for (auto &i : r) {
        cin >> i;
    }

    vector<info> v(n);
    for (int i = 0; i < n; i++) {
        v[i] = {x[i] - r[i], x[i] + r[i], x[i], r[i]};
    }
    ranges::sort(v);

    long long L{}, side{};
    for (int i = 0, j = 1; i < n; i = j) {
        deque<int> q;
        q.push_back(i);
        int k = v[i].l;
        while (q.size()) {
            while (j < n && v[j].l <= k) {
                if (v[j].r > v[q.back()].r) q.push_back(j);
                j++;
            }

            int maxh{};
            for (auto id : q) {
                long long d = abs(k - v[id].o), D = v[id].d;
                maxh = max(maxh, (int)sqrt(D * D - d * d));
            }
            side += maxh;
            L++;

            k++;
            while (q.size() && k > v[q.front()].r) {
                q.pop_front();
            }
        }
    }
    cout << L + side * 2 << '\n';
}
int main() {
    cin.tie(0)->sync_with_stdio(0);
    int t;
    cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}