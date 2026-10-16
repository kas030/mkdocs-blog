#include <bits/stdc++.h>
using namespace std;
void solve(int n, long long m) {
    long long l = n, r = 1LL * n * (n + 1) / 2;
    if (m < l || m > r) {
        cout << "-1\n";
        return;
    }
    m -= n;
    int root = 1;
    vector<int> v(n + 1);
    for (int i = n; m && i > 1; i--) {
        if (i - 1 <= m) {
            m -= i - 1;
            v[i] = 1;
            if (root == 1) root = i;
        }
    }
    cout << root << '\n';
    int last = root;
    v[1] = 1;
    for (int i = n; i >= 1; i--) {
        if (!v[i]) {
            cout << i << " 1\n";
        } else if (i != root) {
            cout << i << ' ' << last << '\n';
            last = i;
        }
    }
}
int main() {
    cin.tie(0)->sync_with_stdio(0);
    int t;
    cin >> t;
    while (t--) {
        int n;
        long long m;
        cin >> n >> m;
        solve(n, m);
    }
    return 0;
}